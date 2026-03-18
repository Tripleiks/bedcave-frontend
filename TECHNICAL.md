# TECHNICAL DOCUMENTATION - BEDCAVE

> Technical reference for developers and contributors

Last Updated: 17. März 2026 | Version: 2.0.0

---

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Next.js   │  │ Tailwind CSS│  │ Framer Motion   │  │
│  │  App Router │  │   Styling   │  │   Animation     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    CMS LAYER                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │               Payload CMS 3.x                    │   │
│  │  Collections: Users, BlogPosts, Pages, Media     │   │
│  │  Globals:     Privacy, Legal                     │   │
│  │  Admin Panel: /admin                             │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ /api/payload│  │ /api/ai/    │  │ /api/grok/      │  │
│  │  /publish   │  │  generate   │  │   search        │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ /api/news   │  │/api/newsletter│ │ /api/youtube/  │  │
│  │  /stream    │  │  /subscribe │  │   ai-videos     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    Turso    │  │ Vercel Blob │  │    Resend       │  │
│  │  (libSQL)   │  │   (Media)   │  │   (Email)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Dev vs. Production:**

| | Development | Production |
| - | ----------- | ---------- |
| Database | `payload.sqlite` (local file) | Turso `libsql://bedcave-tripleiks.aws-eu-west-1.turso.io` |
| Media | `/public/media/` (local) | Vercel Blob (`*.public.blob.vercel-storage.com`) |
| Blob Plugin | Disabled | Enabled (`isProduction` flag) |

---

## Payload CMS

### Collections

| Collection | Slug | Purpose |
| ---------- | ---- | ------- |
| Users | `users` | Auth, role-based access (Admin/Editor/Author) |
| BlogPosts | `blog-posts` | All blog content |
| Pages | `pages` | Static pages |
| Media | `media` | Images with auto-thumbnails (400x300, 768x1024, 1024x559) |

### Globals

| Global | Slug | Purpose |
| ------ | ---- | ------- |
| Privacy | `privacy` | Privacy Policy page content |
| Legal | `legal` | Legal Notice / Imprint content |

### Configuration (`payload.config.ts`)

```typescript
const isProduction = process.env.NODE_ENV === 'production'

buildConfig({
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./payload.sqlite',
      authToken: process.env.DATABASE_AUTH_TOKEN,  // only needed for Turso
    },
  }),
  plugins: [
    ...(isProduction ? [
      vercelBlobStorage({
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN || '',
      }),
    ] : []),
  ],
})
```

---

## API Routes

### `/api/payload/publish` — Publish AI-generated post to Payload

**Method:** POST

**Request Body:**

```json
{
  "title": "Article Title",
  "content": "# Markdown content...",
  "category": "Docker",
  "tags": ["docker", "tutorial"],
  "excerpt": "Short description",
  "imageUrl": "https://..."
}
```

**Process:**

1. Download image from `imageUrl`
2. Upload to Payload Media collection (creates thumbnails)
3. Create BlogPost in Payload with all fields
4. Returns `{ success: true, postId, mediaId }`

---

### `/api/ai/generate` — AI Article Generation

**Method:** POST | **Provider:** Perplexity (`sonar-pro`)

**Request Body:**

```json
{ "prompt": "Docker Compose tutorial", "category": "Docker" }
```

**Response:**

```json
{
  "title": "...", "excerpt": "...", "content": "# Full markdown...",
  "tags": ["docker"], "keywords": ["docker compose"]
}
```

**Environment:** `PERPLEXITY_API_KEY`

---

### `/api/grok/search` — Grok Aurora Image Generation

**Method:** GET | **Query:** `?query=article+title`

**Response:**

```json
{ "success": true, "data": { "url": "https://...", "author": "Grok Aurora AI" } }
```

**Environment:** `XAI_API_KEY`

---

### `/api/images/library` — Image Library (GET/POST/DELETE)

Manages `content/images/library.json` — a JSON store of all Grok-generated images.

**GET** — list all images (optional `?category=docker`)
**POST** — add image with `{ url, title, prompt, tags, category, source }`
**DELETE** — remove by `?id=img_123`

---

### `/api/newsletter/subscribe` — Resend Newsletter

**Method:** POST | **Body:** `{ "email": "user@example.com" }`

**Environment:** `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`

---

### `/api/news/stream` — HackerNews Feed

Streams live tech news for the 3-row news ticker. Falls back to 38 curated items.

---

### `/api/youtube/ai-videos` — YouTube AI Video Carousel

Fetches videos from multiple targeted searches (Claude Code, Perplexity, Generative AI), deduplicates, and returns top 10 by views.

**Environment:** `YOUTUBE_API_KEY`

---

## Frontend Pages

| Route | Type | Data Source |
| ----- | ---- | ----------- |
| `/` | Static | Payload Local API |
| `/blog` | Static | Payload Local API |
| `/blog/[slug]` | Dynamic | Payload Local API |
| `/privacy` | Static | Payload Global `privacy` |
| `/legal` | Static | Payload Global `legal` |
| `/dashboard/ai-generator` | Static (client) | `/api/ai/generate`, `/api/grok/search` |
| `/admin/[[...segments]]` | Dynamic | Payload CMS Admin |

---

## AI Content Flow

```text
User Input
    ↓
Perplexity API (sonar-pro)
    ↓
JSON parse → title, excerpt, content, tags
    ↓
Grok Aurora API → cover image URL
    ↓
POST /api/payload/publish
    ├── Download image → Payload Media (Vercel Blob in prod)
    └── Create BlogPost in Payload (Turso in prod)
```

---

## Design System

### Color Palette

```css
--color-cyan:   #00d4ff;  /* Primary actions */
--color-green:  #39ff14;  /* Success */
--color-pink:   #ff006e;  /* Hardware category */
--color-yellow: #ffbe0b;  /* Warnings / Homelab */
--color-purple: #8338ec;  /* Secondary */

--bg-primary:   #0a0a0f;
--bg-secondary: #13131f;
--border:       #1e293b;
```

### Typography

```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

---

## Deployment Checklist

### Required Environment Variables

| Variable | Where Used |
| -------- | ---------- |
| `PAYLOAD_SECRET` | Payload auth signing |
| `DATABASE_URI` | Turso connection URL (`libsql://...`) |
| `DATABASE_AUTH_TOKEN` | Turso JWT token |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob media storage |
| `ANTHROPIC_API_KEY` | Claude article generation |
| `XAI_API_KEY` | Grok Aurora image generation |
| `PERPLEXITY_API_KEY` | Perplexity article generation |
| `RESEND_API_KEY` | Newsletter emails |
| `RESEND_AUDIENCE_ID` | Resend audience for subscribers |
| `YOUTUBE_API_KEY` | YouTube video carousel |

### Post-Deploy Verification

- [ ] Homepage loads with posts
- [ ] `/blog` shows all 13 posts
- [ ] `/blog/[slug]` renders individual post
- [ ] `/admin` accessible and functional
- [ ] Images load from `*.public.blob.vercel-storage.com`
- [ ] `/dashboard/ai-generator` generates and publishes to Payload
- [ ] Newsletter signup works
- [ ] News ticker animates (all 3 rows)
- [ ] `/privacy` and `/legal` render (edit content in `/admin`)

---

## Migration Notes

The project was migrated from a file-based MDX system to Payload CMS in March 2026.

**Before (legacy):**

- Content: MDX files in `content/posts/`
- Publishing: GitHub API commit via `/api/github/publish`
- Media: Static files in `public/media/`
- Privacy/Legal: Hardcoded React components

**After (current):**

- Content: Payload CMS database (Turso in prod)
- Publishing: `/api/payload/publish` → Payload Local API
- Media: Vercel Blob Storage in prod, local filesystem in dev
- Privacy/Legal: Payload Globals, editable in `/admin`

Migration scripts are in `migration/` (one-time use, kept for reference).
