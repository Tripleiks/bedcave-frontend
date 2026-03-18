# BEDCAVE - The Ultimate Tech Platform

> A modern, terminal-inspired tech blog and community platform for homelab enthusiasts, Docker pros, and cloud architects.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwind-css)
![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.x-blueviolet?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)

## Live

**Production:** [https://bedcave.com](https://bedcave.com)

---

## Features

### Content & Blog

- **Payload CMS** - Headless CMS with admin panel at `/admin`
- **13 Blog Posts** migrated from MDX, managed via Payload
- **Categories:** Docker, Homelab, Hardware, M365, Azure
- **Sticky Posts** - Featured articles highlighted on homepage
- **Article Cards** with terminal-styled design
- **Blog Overview** at `/blog`

### AI Blog Generator (Dashboard)

- **Claude API** - Generate 1200-1500 word technical articles
- **Grok Aurora Image Generation** - Auto-create cover images based on article titles
- **Image Library** - Browse and reuse all generated images (`/dashboard/images`)
- **Save to Payload** - Publishes directly to Payload CMS (creates post + uploads image)
- **Category Selection** - Pre-configured tags and keywords

### CMS & Admin

- **Payload CMS Admin** at `/admin` - Full content management
- **Globals** - Privacy Policy and Legal Notice editable in admin
- **Media Collection** - Image uploads with auto-generated thumbnails (400x300, 768x1024, 1024x559)
- **Users Collection** - Role-based access (Admin/Editor/Author)

### Newsletter System
- **Resend Integration** - Professional email delivery
- **Double Opt-In** - Welcome emails with unsubscribe links

### Live News Ticker
- **3-Row Animated Ticker** - Infinite scrolling with varying speeds
- **HackerNews Integration** - Live tech news with intelligent categorization
- **38 Curated Fallback Items** - Ensures all rows are always filled

### Cloud Status Dashboard

- **4 Major Cloud Providers** - Azure, AWS, Google Cloud, Vercel
- **Real-time Status** - Live operational/degraded/outage indicators
- **Latency Visualization** - Animated ping bars

---

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| CMS | Payload CMS 3.x |
| Database (dev) | SQLite (`payload.sqlite`) |
| Database (prod) | Turso (libSQL hosted SQLite) |
| Media (dev) | Local filesystem (`/public/media`) |
| Media (prod) | Vercel Blob Storage |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Email | Resend |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Tripleiks/bedcave-frontend.git
cd bedcave-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site, [http://localhost:3000/admin](http://localhost:3000/admin) for the CMS.

---

## Environment Variables

Create `.env.local`:

```env
# Payload CMS
PAYLOAD_SECRET=your-random-secret-key

# Database (dev uses local SQLite automatically if not set)
DATABASE_URI=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=your-turso-token

# Media Storage (only needed in production)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# AI Blog Generation
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
PERPLEXITY_API_KEY=pplx-...

# Newsletter
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...

# YouTube AI Videos
YOUTUBE_API_KEY=...
```

---

## Project Structure

```
bedcave-frontend/
├── src/
│   ├── app/
│   │   ├── (frontend)/          # Public-facing pages
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── blog/            # Blog overview + detail pages
│   │   │   ├── dashboard/       # Custom admin dashboard + AI tools
│   │   │   ├── privacy/         # Privacy Policy (from Payload Global)
│   │   │   └── legal/           # Legal Notice (from Payload Global)
│   │   └── (payload)/
│   │       └── admin/           # Payload CMS Admin Panel
│   ├── api/
│   │   ├── payload/publish/     # AI post publish → Payload CMS
│   │   ├── ai/generate/         # Perplexity article generation
│   │   ├── grok/search/         # Grok Aurora image generation
│   │   ├── images/library/      # Image library management
│   │   ├── news/                # HackerNews feed
│   │   ├── newsletter/subscribe/# Resend newsletter signup
│   │   └── youtube/ai-videos/   # YouTube AI video carousel
│   └── components/              # React components
├── collections/
│   ├── Users.ts
│   ├── BlogPosts.ts
│   ├── Pages.ts
│   └── Media.ts
├── globals/
│   ├── Privacy.ts
│   └── Legal.ts
├── migration/                   # One-time migration scripts
└── payload.config.ts            # Payload CMS configuration
```

---

## Creating Content

### New Blog Post (recommended)

1. Visit `/admin` and log in
2. Navigate to **Blog Posts → Create New**
3. Fill in title, content, category, image
4. Publish

### AI-Assisted Post

1. Visit `/dashboard/ai-generator`
2. Enter topic and select category
3. Generate article with Claude
4. Generate cover image with Grok Aurora
5. Click **SAVE TO PAYLOAD** — post + image are created automatically

---

## Deployment

### Vercel + Turso + Vercel Blob (production setup)

**Required environment variables in Vercel:**

| Variable | Description |
|----------|-------------|
| `PAYLOAD_SECRET` | Random secret for Payload auth |
| `DATABASE_URI` | `libsql://your-db.turso.io` |
| `DATABASE_AUTH_TOKEN` | Turso auth token |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |
| `ANTHROPIC_API_KEY` | Claude API |
| `XAI_API_KEY` | Grok Aurora |
| `PERPLEXITY_API_KEY` | Perplexity |
| `RESEND_API_KEY` | Email |
| `RESEND_AUDIENCE_ID` | Newsletter audience |
| `YOUTUBE_API_KEY` | YouTube carousel |

```bash
vercel --prod
```

---

## Links

- **Live Site:** https://bedcave.com
- **Admin:** https://bedcave.com/admin
- **GitHub:** https://github.com/Tripleiks/bedcave-frontend

---

> Built for the homelab and DevOps community
