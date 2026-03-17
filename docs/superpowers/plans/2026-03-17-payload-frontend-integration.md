# Payload CMS Frontend Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the MDX filesystem data layer with a Payload CMS REST API client so all blog pages render live data from Payload.

**Architecture:** New `src/lib/payload/` module provides typed API functions returning `PayloadPost`. Server Components resolve media URLs before passing data to Client Components. Lexical JSON content is extracted to plain text and rendered with the existing `react-markdown` pipeline.

**Tech Stack:** Next.js 15 App Router (SSR), Payload CMS 3.x REST API, TypeScript, Vitest (unit tests for pure functions)

**Spec:** `docs/superpowers/specs/2026-03-17-payload-frontend-integration-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/lib/payload/types.ts` | PayloadPost type + Lexical JSON types |
| Create | `src/lib/payload/posts.ts` | API client + utility functions |
| Create | `src/lib/payload/__tests__/posts.test.ts` | Unit tests for pure utility functions in posts.ts |
| Modify | `src/components/article-card.tsx` | Accept PayloadPost, resolve image/author/tags |
| Modify | `src/components/home-content.tsx` | Accept PayloadPost[] props |
| Modify | `src/app/page.tsx` | Fetch from Payload, resolve media URLs |
| Modify | `src/app/blog/[slug]/page.tsx` | SSR with Payload, remove generateStaticParams |
| Modify | `src/app/homelab/page.tsx` | getPostsByCategory('homelab') |
| Modify | `src/app/docker/page.tsx` | getPostsByCategory('docker') |
| Modify | `src/app/hardware/page.tsx` | getPostsByCategory('hardware') |
| Modify | `next.config.mjs` | Add localhost to remotePatterns |
| Create | `.env.example` | Document PAYLOAD_URL |

---

## Chunk 1: Test infrastructure + Types + Utility functions

### Task 1: Install Vitest

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
cd bedcave-frontend
npm install --save-dev vitest @vitest/ui
```

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Exclude Next.js app directory — only test pure utility modules
    include: ['src/lib/**/__tests__/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Verify Vitest works**

```bash
npm test
```

Expected: `No test files found` (exits 0 or with "no test files" message — not a crash)

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: add vitest for unit testing"
```

---

### Task 2: Create PayloadPost types

**Files:**

- Create: `src/lib/payload/types.ts`

- [ ] **Step 1: Create `src/lib/payload/types.ts`**

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
  category: PayloadCategory
  /** Payload array field — always access as (tags ?? []).map(t => t.tag) */
  tags: { tag: string }[]
  status: 'draft' | 'published' | 'archived'
  publishedAt: string
  /** Replaces MDX sticky field */
  featured: boolean
  /** Object when depth >= 1, string (id) at depth 0 */
  author: PayloadAuthor | string
  /** Payload returns relative paths like /media/image.jpg */
  featuredImage?: PayloadMediaObject | string | null
  metaTitle?: string
  metaDescription?: string
}

/** Shape of a Payload REST list response */
export interface PayloadListResponse {
  docs: PayloadPost[]
  totalDocs: number
  limit: number
  page: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors for the new file

- [ ] **Step 3: Commit**

```bash
git add src/lib/payload/types.ts
git commit -m "feat: add PayloadPost TypeScript types"
```

---

### Task 3: Write failing tests for utility functions

**Files:**

- Create: `src/lib/payload/__tests__/posts.test.ts`

Note: The file is named `posts.test.ts` because it tests `posts.ts`. The import path `'../posts'` is correct.

- [ ] **Step 1: Create test file**

```typescript
import { describe, it, expect } from 'vitest'
import { lexicalToMarkdown, calculateReadingTime, resolveMediaUrl } from '../posts'

describe('lexicalToMarkdown', () => {
  it('extracts text from a single paragraph node', () => {
    const lexical = {
      root: {
        type: 'root' as const,
        children: [{
          type: 'paragraph' as const,
          children: [{ type: 'text' as const, text: 'Hello world' }],
        }],
      },
    }
    expect(lexicalToMarkdown(lexical)).toBe('Hello world')
  })

  it('joins multiple paragraphs with double newline', () => {
    const lexical = {
      root: {
        type: 'root' as const,
        children: [
          { type: 'paragraph' as const, children: [{ type: 'text' as const, text: 'First' }] },
          { type: 'paragraph' as const, children: [{ type: 'text' as const, text: 'Second' }] },
        ],
      },
    }
    expect(lexicalToMarkdown(lexical)).toBe('First\n\nSecond')
  })

  it('returns empty string for empty content', () => {
    const lexical = { root: { type: 'root' as const, children: [] } }
    expect(lexicalToMarkdown(lexical)).toBe('')
  })
})

describe('calculateReadingTime', () => {
  it('returns 1 for short text', () => {
    expect(calculateReadingTime('hello world')).toBe(1)
  })

  it('returns correct value for 400 words', () => {
    const text = 'word '.repeat(400)
    expect(calculateReadingTime(text)).toBe(2)
  })
})

describe('resolveMediaUrl', () => {
  it('prepends baseUrl to relative paths', () => {
    expect(resolveMediaUrl('http://localhost:3000', '/media/img.jpg'))
      .toBe('http://localhost:3000/media/img.jpg')
  })

  it('returns absolute URLs unchanged', () => {
    expect(resolveMediaUrl('http://localhost:3000', 'https://cdn.example.com/img.jpg'))
      .toBe('https://cdn.example.com/img.jpg')
  })

  it('returns undefined for undefined input', () => {
    expect(resolveMediaUrl('http://localhost:3000', undefined)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../posts'` or `ERR_MODULE_NOT_FOUND`.
This module resolution error IS the expected red-state — not a setup problem. Proceed to Task 4.

---

### Task 4: Implement utility functions in posts.ts

**Files:**

- Create: `src/lib/payload/posts.ts`

- [ ] **Step 1: Create `src/lib/payload/posts.ts` with utility functions only**

```typescript
import type { LexicalJSON, PayloadCategory, PayloadPost, PayloadListResponse } from './types'

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? 'http://localhost:3000'

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Extracts plain text from a Payload Lexical JSON document.
 * Paragraphs are joined with double newlines (Markdown paragraph separator).
 */
export function lexicalToMarkdown(content: LexicalJSON): string {
  return content.root.children
    .map(node => node.children.map(child => child.text).join(''))
    .join('\n\n')
}

/**
 * Estimates reading time in minutes.
 */
export function calculateReadingTime(text: string): number {
  const wordCount = text.split(/\s+/g).filter(Boolean).length
  return Math.ceil(wordCount / 200)
}

/**
 * Resolves a Payload media URL to an absolute URL.
 * Payload stores media as relative paths (e.g. /media/image.jpg).
 * Pass baseUrl explicitly so this stays a pure function (no process.env reads).
 */
export function resolveMediaUrl(baseUrl: string, url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('/')) return `${baseUrl}${url}`
  return url
}

// ─── API client ─────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<PayloadPost[]> {
  try {
    // limit=0 in Payload v3 disables pagination and returns all documents.
    // Verify this works: curl http://localhost:3000/api/blog-posts?limit=0 should return all docs.
    // If your Payload version does not support limit=0, use limit=100 instead.
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[status][equals]=published&sort=-publishedAt&depth=1&limit=0`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    const data: PayloadListResponse = await res.json()
    return data.docs
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<PayloadPost | null> {
  try {
    const encoded = encodeURIComponent(slug)
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[slug][equals]=${encoded}&where[status][equals]=published&depth=1&limit=1`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    const data: PayloadListResponse = await res.json()
    return data.docs[0] ?? null
  } catch {
    return null
  }
}

export async function getPostsByCategory(category: PayloadCategory): Promise<PayloadPost[]> {
  try {
    const res = await fetch(
      `${PAYLOAD_URL}/api/blog-posts?where[status][equals]=published&where[category][equals]=${category}&sort=-publishedAt&depth=1&limit=0`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    const data: PayloadListResponse = await res.json()
    return data.docs
  } catch {
    return []
  }
}

/** Resolved base URL for passing to resolveMediaUrl() in Server Components */
export { PAYLOAD_URL }
```

- [ ] **Step 2: Run tests — verify they pass**

```bash
npm test
```

Expected: all 7 tests PASS

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/payload/posts.ts src/lib/payload/__tests__/posts.test.ts
git commit -m "feat: add Payload API client and utility functions"
```

---

## Chunk 2: Components

### Task 5: Update ArticleCard component

**Files:**

- Modify: `src/components/article-card.tsx`

`article-card.tsx` is a `"use client"` component. It must NOT call `resolveMediaUrl` itself. Instead, image URLs are resolved by the parent Server Component before being passed as props. The component receives a `PayloadPost` where `featuredImage` is already an absolute URL string (resolved upstream) or `null`.

Because of this, we introduce a `resolvedImageUrl?: string` prop alongside `post: PayloadPost`. The component reads `resolvedImageUrl` for the `<Image src>` instead of computing it internally.

- [ ] **Step 1: Update `src/components/article-card.tsx`**

Replace the import and prop types at the top:

```typescript
// Remove:
import { Post } from '@/lib/mdx/posts';

// Add:
import type { PayloadPost } from '@/lib/payload/types';
```

Replace the `ArticleCardProps` interface:

```typescript
interface ArticleCardProps {
  post: PayloadPost
  resolvedImageUrl?: string   // Pre-resolved absolute URL from parent Server Component
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}
```

Update `categoryColors` keys to lowercase. All eight `PayloadCategory` values must have an entry — four were previously missing. The new map:

```typescript
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'news':        { bg: 'bg-[#00d4ff]/10',  text: 'text-[#00d4ff]',  border: 'border-[#00d4ff]/30'  },
  'hardware':    { bg: 'bg-[#39ff14]/10',  text: 'text-[#39ff14]',  border: 'border-[#39ff14]/30'  },
  'docker':      { bg: 'bg-[#ff006e]/10',  text: 'text-[#ff006e]',  border: 'border-[#ff006e]/30'  },
  'homelab':     { bg: 'bg-[#ffbe0b]/10',  text: 'text-[#ffbe0b]',  border: 'border-[#ffbe0b]/30'  },
  'ai-tools':    { bg: 'bg-[#8338ec]/10',  text: 'text-[#8338ec]',  border: 'border-[#8338ec]/30'  },
  'development': { bg: 'bg-[#39ff14]/10',  text: 'text-[#39ff14]',  border: 'border-[#39ff14]/30'  },
  'design':      { bg: 'bg-[#ff006e]/10',  text: 'text-[#ff006e]',  border: 'border-[#ff006e]/30'  },
  'tutorial':    { bg: 'bg-[#00d4ff]/10',  text: 'text-[#00d4ff]',  border: 'border-[#00d4ff]/30'  },
}
```

Update field resolution at the start of `ArticleCard`. **Resolve `author` once at the top of the component function, before any variant branching** — the component has multiple render paths (featured, compact, default) that all use `author`:

```typescript
export function ArticleCard({ post, resolvedImageUrl, variant = 'default', className = '' }: ArticleCardProps) {
  const imageUrl = resolvedImageUrl   // already resolved by parent Server Component
  const altText = post.title
  const filename = `${post.slug.slice(0, 20)}${post.slug.length > 20 ? '...' : ''}.md`
  const mainCategory = post.category || 'news'   // fallback 'news' not 'Article' — must be lowercase to match categoryColors keys
  // Resolve once — post.author is PayloadAuthor | string (object at depth=1)
  const author = typeof post.author === 'object' ? post.author.name : String(post.author)
  const tags = (post.tags ?? []).map(t => t.tag)

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-')
  // ... rest of component unchanged
```

Replace any remaining `post.author`, `post.coverImage`, `post.tags`, `post.date`, `post.sticky` references with the resolved variables above.

Also update the two legacy fallback references in the existing code:

- Line ~111: `post.category || 'Article'` → `post.category || 'news'` (already handled by `mainCategory` above)
- Line ~196 in compact variant: `categoryColors['News']` → `categoryColors[mainCategory]` (use the resolved variable)

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests still pass

- [ ] **Step 4: Commit**

```bash
git add src/components/article-card.tsx
git commit -m "feat: update ArticleCard to use PayloadPost type"
```

---

### Task 6: Update HomeContent component

**Files:**

- Modify: `src/components/home-content.tsx`

- [ ] **Step 1: Update imports and props in `src/components/home-content.tsx`**

```typescript
// Remove:
import { Post } from "@/lib/mdx/posts";

// Add:
import type { PayloadPost } from "@/lib/payload/types";
```

Replace `HomeContentProps`:

```typescript
interface HomeContentProps {
  recentPosts: PayloadPost[]
  stickyPosts: PayloadPost[]
  /** Map of post.slug → absolute image URL, built by the parent Server Component.
   *  Key is always post.slug (not post.id). */
  resolvedImageUrls: Record<string, string>
}
```

Update every `<ArticleCard>` call in the file to pass `resolvedImageUrl`:

```typescript
// Before:
<ArticleCard key={post.slug} post={post} variant="default" />

// After:
<ArticleCard key={post.slug} post={post} resolvedImageUrl={resolvedImageUrls[post.slug]} variant="default" />
```

Apply to all three call sites: sticky posts (variant="default"), featured top-2 (variant="featured"), and the 3–11 grid (variant="default").

Note: The `compact` variant is not used in `home-content.tsx` today — no action needed for compact call sites.

- [ ] **Step 2: Do NOT run tsc yet — proceed directly to Task 7**

> ⚠️ After changing `HomeContentProps`, `src/app/page.tsx` will have a TypeScript error (missing `resolvedImageUrls` prop and wrong post type). This is expected. **Tasks 6 and 7 must be committed together in one step** to keep the build green. Do not commit until Task 7 is complete.

- [ ] **Step 3: Continue to Task 7 immediately — commit both files together at the end of Task 7**

---

## Chunk 3: Pages

### Task 7: Update home page

**Files:**

- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```typescript
import { HomeContent } from "@/components/home-content";
import { getAllPosts, resolveMediaUrl, PAYLOAD_URL } from "@/lib/payload/posts";

export default async function Home() {
  const posts = await getAllPosts()

  const stickyPosts = posts.filter(post => post.featured).slice(0, 3)

  // Resolve all image URLs server-side before passing to Client Components
  const resolvedImageUrls: Record<string, string> = {}
  for (const post of posts) {
    if (post.featuredImage && typeof post.featuredImage === 'object') {
      const resolved = resolveMediaUrl(PAYLOAD_URL, post.featuredImage.url)
      if (resolved) resolvedImageUrls[post.slug] = resolved
    }
  }

  return (
    <HomeContent
      recentPosts={posts}
      stickyPosts={stickyPosts}
      resolvedImageUrls={resolvedImageUrls}
    />
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit Tasks 6 + 7 together** (home-content.tsx broke the build — page.tsx fixes it)

```bash
git add src/components/home-content.tsx src/app/page.tsx
git commit -m "feat: connect home page and HomeContent to Payload CMS API"
```

---

### Task 8: Update blog post detail page

**Files:**

- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Replace `src/app/blog/[slug]/page.tsx`**

```typescript
import {
  getPostBySlug,
  lexicalToMarkdown,
  calculateReadingTime,
  resolveMediaUrl,
  PAYLOAD_URL,
} from '@/lib/payload/posts'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Tag, BookOpen } from 'lucide-react'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '@/components/code-block'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found - Bedcave' }
  return {
    title: `${post.metaTitle ?? post.title} - Bedcave`,
    description: post.metaDescription ?? post.excerpt,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const content = lexicalToMarkdown(post.content)
  const readingTime = calculateReadingTime(content)
  const author = typeof post.author === 'object' ? post.author.name : 'Bedcave Team'
  const coverImageUrl = post.featuredImage && typeof post.featuredImage === 'object'
    ? resolveMediaUrl(PAYLOAD_URL, post.featuredImage.url)
    : undefined
  const tags = (post.tags ?? []).map(t => t.tag)

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
            <div className="font-mono text-sm text-[#64748b]">
              bedcave.com/blog/{slug}
            </div>
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded bg-[#00d4ff]/10 text-[#00d4ff] font-mono text-sm border border-[#00d4ff]/30">
              [{post.category.toUpperCase()}]
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-mono">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 font-mono text-sm text-[#64748b] border-b border-[#1e293b] pb-8">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {author}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </span>
          </div>

          {/* Cover Image */}
          {coverImageUrl && (
            <div className="mb-8 rounded-lg overflow-hidden border border-[#1e293b]">
              <img src={coverImageUrl} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none font-mono">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-6 font-mono">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4 font-mono">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mt-6 mb-3 font-mono">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed font-mono">{children}</p>,
                code: ({ children }) => <code className="bg-[#1e293b] text-[#39ff14] px-2 py-1 rounded text-sm font-mono">{children}</code>,
                pre: CodeBlock,
              }}
            >
              {content}
            </Markdown>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#1e293b]">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-[#64748b]" />
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded bg-[#1e293b] text-[#00d4ff] font-mono text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#1e293b]">
            <Link href="/" className="font-mono text-[#00d4ff] hover:underline flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/blog/[slug]/page.tsx
git commit -m "feat: connect blog detail page to Payload CMS API (SSR)"
```

---

### Task 9: Update category pages

**Files:**

- Modify: `src/app/homelab/page.tsx`
- Modify: `src/app/docker/page.tsx`
- Modify: `src/app/hardware/page.tsx`

These three pages are identical except for the category value and display label.

- [ ] **Step 1: Update `src/app/homelab/page.tsx`**

```typescript
import { getPostsByCategory, resolveMediaUrl, PAYLOAD_URL } from "@/lib/payload/posts";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { ArrowLeft, Server } from "lucide-react";

export default async function HomelabPage() {
  const posts = await getPostsByCategory('homelab')

  const resolvedImageUrls: Record<string, string> = {}
  for (const post of posts) {
    if (post.featuredImage && typeof post.featuredImage === 'object') {
      const resolved = resolveMediaUrl(PAYLOAD_URL, post.featuredImage.url)
      if (resolved) resolvedImageUrls[post.slug] = resolved
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header — unchanged */}
      <header className="border-b border-[#1e293b] bg-[#0f0f1a]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-mono text-[#00d4ff] hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              $ cd /home
            </Link>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-[#ffbe0b]" />
              <span className="font-mono text-[#ffbe0b]">Homelab</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 font-mono">
              <span className="text-[#ffbe0b]">~/</span>homelab
            </h1>
            <p className="text-[#64748b] font-mono">
              Building and managing home server infrastructure.
            </p>
          </div>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <ArticleCard
                  key={post.slug}
                  post={post}
                  resolvedImageUrl={resolvedImageUrls[post.slug]}
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#64748b] font-mono">No homelab posts yet. Coming soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Apply same pattern to `src/app/docker/page.tsx`**

Same structure as homelab but with `getPostsByCategory('docker')` and Docker-appropriate labels/colors.

- [ ] **Step 3: Apply same pattern to `src/app/hardware/page.tsx`**

Same structure but `getPostsByCategory('hardware')`.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/homelab/page.tsx src/app/docker/page.tsx src/app/hardware/page.tsx
git commit -m "feat: connect category pages to Payload CMS API"
```

---

## Chunk 4: Config + environment

### Task 10: Update next.config.mjs and add .env.example

**Files:**

- Modify: `next.config.mjs`
- Create: `.env.example`

The active Next.js config is `next.config.mjs` (it imports `createMDX`). `next.config.ts` exists as a duplicate — it should be deleted to avoid confusion.

- [ ] **Step 1: Add localhost to remotePatterns in `next.config.mjs`**

In the `remotePatterns` array, add:

```javascript
{
  protocol: 'http',
  hostname: 'localhost',
  port: '3000',
  pathname: '/media/**',
},
// Production Payload CMS URL — add when known:
// { protocol: 'https', hostname: 'cms.bedcave.com', pathname: '/media/**' },
```

- [ ] **Step 2: Delete the duplicate `next.config.ts`**

```bash
rm bedcave-frontend/next.config.ts
```

- [ ] **Step 3: Create `.env.example`**

```bash
# Payload CMS server URL (server-only — no NEXT_PUBLIC_ prefix)
# Development default — change to your production URL for deployment
PAYLOAD_URL=http://localhost:3000
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: successful build, no TypeScript errors

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add next.config.mjs .env.example
git rm next.config.ts
git commit -m "feat: add Payload media hostname to next/image remotePatterns"
```

---

## Chunk 5: Manual verification

### Task 11: End-to-end smoke test

This task requires the Payload server to be running and populated (see `MIGRATION_STATUS.md` Task 5 for import instructions).

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify home page loads**

Open `http://localhost:3000` — confirm posts appear in the grid.
If the Payload import hasn't been run yet, the grid shows the empty state — that is correct behaviour.

- [ ] **Step 3: Verify blog detail page (SSR)**

Open any post URL e.g. `http://localhost:3000/blog/some-slug`.
Confirm: title, date, content, tags render correctly. No `[object Object]` in tags.

- [ ] **Step 4: Verify category pages**

Open `/homelab`, `/docker`, `/hardware` — posts filtered by category appear.

- [ ] **Step 5: Verify 404 behaviour**

Open `http://localhost:3000/blog/does-not-exist` — confirm Next.js 404 page renders.

- [ ] **Step 6: Update MIGRATION_STATUS.md**

Mark frontend integration complete, update progress bar to 90%.

- [ ] **Step 7: Final commit**

```bash
git add MIGRATION_STATUS.md
git commit -m "docs: mark frontend Payload integration complete in MIGRATION_STATUS"
```
