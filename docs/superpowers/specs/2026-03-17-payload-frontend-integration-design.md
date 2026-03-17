# Design: Frontend Integration with Payload CMS API

**Date:** 2026-03-17
**Status:** Approved
**Context:** bedcave-frontend — replacing MDX file-based data layer with Payload CMS REST API

---

## Overview

Replace the existing `src/lib/mdx/posts.ts` filesystem-based data layer with a Payload CMS REST API client. All frontend pages and components are updated to use the new `PayloadPost` type directly (no adapter shim).

**Rendering mode:** SSR (Server-Side Rendering) throughout — no `generateStaticParams`, no build-time dependency on the Payload server.

**Content rendering:** Lexical JSON → plain text extraction → `react-markdown` (same rendering pipeline as before, since migrated content is stored as Markdown plain text inside a single Lexical paragraph node).

---

## Architecture

### New Files

**`src/lib/payload/types.ts`**

```typescript
export interface LexicalTextNode {
  type: 'text'
  text: string
  format?: number
}

export interface LexicalParagraphNode {
  type: 'paragraph'
  children: LexicalTextNode[]
}

export interface LexicalRoot {
  type: 'root'
  children: LexicalParagraphNode[]
}

export interface LexicalJSON {
  root: LexicalRoot
}

export interface PayloadMediaObject {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface PayloadAuthor {
  id: string
  name: string
  email: string
}

export type PayloadCategory =
  | 'ai-tools'
  | 'development'
  | 'design'
  | 'news'
  | 'tutorial'
  | 'homelab'
  | 'docker'
  | 'hardware'

export interface PayloadPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: LexicalJSON
  category: PayloadCategory          // always lowercase (Payload select value)
  tags: { tag: string }[]            // Payload array field — use tags.map(t => t.tag)
  status: 'draft' | 'published' | 'archived'
  publishedAt: string
  featured: boolean                  // replaces MDX sticky field
  author: PayloadAuthor | string     // string at depth=0, object at depth>=1
  featuredImage?: PayloadMediaObject | string | null
  metaTitle?: string
  metaDescription?: string
  // NOTE: sources, aiModel, readingTime are NOT present — these were MDX-only fields.
  //       The Sources section and aiModel credit in blog/[slug]/page.tsx are intentionally removed.
}
```

**`src/lib/payload/posts.ts`**

```typescript
const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3000'

getAllPosts(): Promise<PayloadPost[]>
  → GET /api/blog-posts?where[status][equals]=published&sort=-publishedAt&depth=1&limit=0
  → limit=0 fetches ALL documents (Payload supports this) — no silent truncation

getPostBySlug(slug: string): Promise<PayloadPost | null>
  → GET /api/blog-posts?where[slug][equals]=<slug>&where[status][equals]=published&depth=1&limit=1
  → On error or not found: return null

getPostsByCategory(category: PayloadCategory): Promise<PayloadPost[]>
  → GET /api/blog-posts?where[status][equals]=published&where[category][equals]=<category>&sort=-publishedAt&depth=1&limit=0
  → limit=0 fetches all posts in category

lexicalToMarkdown(content: LexicalJSON): string
  → Traverses root.children → paragraph.children → text nodes → joined with '\n\n'

calculateReadingTime(text: string): number
  → Math.ceil(wordCount / 200)

resolveMediaUrl(url: string | undefined): string | undefined
  → Pure utility — takes PAYLOAD_URL as parameter (no process.env read)
  → Prepends baseUrl if url starts with '/'
  → e.g. resolveMediaUrl('http://localhost:3000', '/media/image.jpg') → 'http://localhost:3000/media/image.jpg'
  → Called only in Server Components (page.tsx, blog/[slug]/page.tsx, category pages)
  → NOT exported to or called from Client Components
```

---

## Files Updated

### `src/app/page.tsx`

- Import `getAllPosts`, `resolveMediaUrl` from `@/lib/payload/posts`
- Filter `featured === true` for `stickyPosts` (max 3), replaces `sticky`
- Resolve `featuredImage.url` via `resolveMediaUrl` before passing posts to `HomeContent`
- Pass `PayloadPost[]` (with resolved absolute image URLs) to `HomeContent`

### `src/app/blog/[slug]/page.tsx`

- Remove `generateStaticParams` export → SSR
- Import `getPostBySlug`, `resolveMediaUrl` from `@/lib/payload/posts`
- `getPostBySlug` returning `null` → call `notFound()` immediately
- Update `generateMetadata` to use `post.metaTitle ?? post.title` and `post.metaDescription ?? post.excerpt`
- Extract text: `const markdownContent = lexicalToMarkdown(post.content)`
- Resolve author: `typeof post.author === 'object' ? post.author.name : 'Bedcave Team'`
- Resolve image: `resolveMediaUrl(typeof post.featuredImage === 'object' ? post.featuredImage?.url : undefined)`
- Calculate `readingTime` from extracted markdown text
- Use `post.publishedAt` instead of `post.date`
- Update tags rendering: `(post.tags ?? []).map(t => t.tag)` — null guard for optional field
- **Remove** Sources section (`post.sources`) and aiModel credit — intentional, these fields don't exist in Payload

### `src/app/homelab/page.tsx`

- Import `getPostsByCategory` from `@/lib/payload/posts`
- Call `getPostsByCategory('homelab')` — lowercase matches Payload select value

### `src/app/docker/page.tsx`

- Call `getPostsByCategory('docker')`

### `src/app/hardware/page.tsx`

- Call `getPostsByCategory('hardware')`

### `src/components/article-card.tsx`

- Import `PayloadPost` from `@/lib/payload/types`
- Prop: `post: PayloadPost`
- Field mappings:
  - `post.date` → `post.publishedAt`
  - `post.author` (string) → `typeof post.author === 'object' ? post.author.name : String(post.author)`
  - `post.coverImage` → `typeof post.featuredImage === 'object' ? post.featuredImage?.url : undefined`
  - `post.tags` (string[]) → `(post.tags ?? []).map(t => t.tag)` — null guard required (optional field)
  - `post.sticky` → `post.featured`
- Image src: resolved URLs passed down as props from parent Server Components (NOT computed in this Client Component)
- Update `categoryColors` map keys to lowercase:

  ```typescript
  const categoryColors = {
    'news':      { bg: '...', text: '...', border: '...' },
    'hardware':  { bg: '...', text: '...', border: '...' },
    'docker':    { bg: '...', text: '...', border: '...' },
    'homelab':   { bg: '...', text: '...', border: '...' },
  }
  ```

  Display label via `post.category.toUpperCase()` (unchanged — still renders as `[HOMELAB]` etc.)

### `src/components/home-content.tsx`

- Import `PayloadPost` from `@/lib/payload/types`
- Props: `recentPosts: PayloadPost[]`, `stickyPosts: PayloadPost[]`

### `next.config.ts`

- Add Payload server hostname to `images.remotePatterns`:

  ```typescript
  // Development
  { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/media/**' }
  // Production — add when Payload production URL is known:
  // { protocol: 'https', hostname: 'cms.bedcave.com', pathname: '/media/**' }
  ```

---

## Files NOT Changed

- `src/app/post/[slug]/page.tsx` — WordPress legacy route, stays as-is (uses `@/lib/wordpress-client`)
- `src/lib/mdx/posts.ts` — kept for reference but no longer imported by any page
- All dashboard/admin routes

---

## Data Flow

```text
Payload SQLite DB
      ↓
Payload REST API  (GET /api/blog-posts)
      ↓
src/lib/payload/posts.ts  (fetch + type-safe parsing)
      ↓
Next.js Server Components  (page.tsx, blog/[slug]/page.tsx, etc.)
      ↓
PayloadPost[]  →  ArticleCard, HomeContent
      ↓
lexicalToMarkdown()  →  react-markdown  (detail page only)
```

---

## Environment Variables

```env
# .env.local (development)
PAYLOAD_URL=http://localhost:3000

# Production: set to internal Payload server URL, e.g.:
# PAYLOAD_URL=https://cms.bedcave.com
```

- `PAYLOAD_URL` is a **server-only** variable (no `NEXT_PUBLIC_` prefix) — used exclusively in Server Components and API route handlers. It is never exposed to the browser bundle.
- Create `.env.example` with `PAYLOAD_URL=http://localhost:3000` as documentation.

---

## Error Handling

- `getAllPosts` / `getPostsByCategory`: return `[]` on fetch error → page renders empty state
- `getPostBySlug`: return `null` on error / not found → page calls `notFound()`
- No retries — simple fail-fast appropriate for a personal blog
