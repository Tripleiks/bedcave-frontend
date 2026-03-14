# 🖥️ BEDCAVE - The Ultimate Tech Platform

> A modern, terminal-inspired tech blog and community platform for homelab enthusiasts, Docker pros, and cloud architects.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)

## 🚀 Live Demo

**Production:** [https://bedcave.com](https://bedcave.com)

---

## ✨ Features

### 📝 Content & Blog
- **MDX-Based Articles** - Write technical posts with React components embedded
- **Dynamic Post Rendering** - Server-side rendering for SEO optimization
- **Categories:** Docker, Homelab, Hardware, M365, Azure
- **Sticky Posts** - Featured articles highlighted on homepage
- **Article Cards** with terminal-styled design

### 🤖 AI Blog Generator (Admin)
- **Claude API Integration** - Generate 1200-1500 word technical articles
- **Grok Aurora Image Generation** - Auto-create cover images based on article titles
- **Image Library** - Store and reuse all generated images (`/admin/images`)
- **Library Selection** - Choose from existing images in AI Generator and New Post form
- **GitHub Auto-Publish** - Direct commit to repository from admin panel
- **Category Selection** - Pre-configured tags and keywords
- **MDX Export** - Download articles for manual editing

### 🖼️ Image Library System
- **Automatic Storage** - All Grok-generated images saved to JSON library
- **Admin Interface** - Browse, search, copy URLs, delete images (`/admin/images`)
- **Category Filtering** - Filter by Docker, Hardware, Homelab, etc.
- **Stats Dashboard** - View total images per category
- **Reuse Anywhere** - Select library images in AI Generator and New Post form
- **Grid/List Views** - Toggle between visual grid and list view

### 📝 New Post Form
- **Terminal-Style UI** - Consistent with site design
- **Cover Image Selection** - Choose from library or generate with AI
- **Live MDX Preview** - Real-time generated output
- **Quick Image Insert** - Insert images into content
- **Form Validation** - Required fields and formatting

### 📧 Newsletter System
- **Resend Integration** - Professional email delivery
- **Double Opt-In** - Welcome emails with unsubscribe links
- **Subscriber Management** - Audience tracking via Resend dashboard
- **Terminal-Style UI** - Consistent with site design

### 📰 Live News Ticker
- **3-Row Animated Ticker** - Infinite scrolling with varying speeds
- **Categories:** Docker, Unraid, Homelab, M365, Azure
- **Vivid Colors** - Cyan (#00d4ff), Pink (#ff006e), Neon Green (#39ff14)
- **NEW Badges** - Highlights for latest news items
- **Terminal Aesthetics** - Glow effects and smooth animations

### 🎨 Design System
- **Terminal/IDE Inspired** - Dark theme with monospace fonts
- **Vivid Accent Colors:**
  - Cyan `#00d4ff` - Primary actions
  - Neon Green `#39ff14` - Success states
  - Pink `#ff006e` - Hardware category
  - Yellow `#ffbe0b` - Warnings/highlights
  - Purple `#8338ec` - Secondary elements
- **Interactive Components:**
  - System stats with live CPU/RAM simulation
  - Typing command animation
  - Digital clock
  - Tech stack pills
  - Quote ticker

### 🖥️ Dashboard Components
- **System Stats** - Animated CPU, RAM, container count, uptime
- **Typing Command** - Cycling terminal commands with cursor
- **Quick Commands** - Navigation shortcuts
- **Digital Clock** - Real-time display with ISO date
- **Tech Stack Pills** - Animated technology badges
- **Quote Ticker** - Rotating tech quotes

### 🔧 Technical Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel
- **Content:** MDX with gray-matter

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/Tripleiks/bedcave-frontend.git
cd bedcave-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
# AI Blog Generation
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...

# GitHub Auto-Publish
GITHUB_TOKEN=ghp_...
GITHUB_REPO=Tripleiks/bedcave-frontend
GITHUB_BRANCH=main

# Newsletter
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ID=...

# Optional: Analytics, etc.
```

---

## 📁 Project Structure

```
bedcave-frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── admin/          # Admin panel (AI generator)
│   │   ├── api/            # API routes
│   │   ├── blog/           # Blog listing
│   │   ├── docker/         # Docker category page
│   │   ├── hardware/       # Hardware category page
│   │   ├── homelab/        # Homelab category page
│   │   └── ...
│   ├── components/         # React components
│   │   ├── article-card.tsx
│   │   ├── hero-section.tsx
│   │   ├── home-content.tsx
│   │   ├── news-ticker.tsx
│   │   └── ui/            # UI components
│   ├── lib/               # Utilities
│   │   └── mdx/           # MDX processing
│   └── types/             # TypeScript types
├── content/
│   └── posts/             # MDX blog posts
├── public/                # Static assets
└── ...
```

---

## 🎯 Key Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| MDX Blog | ✅ Live | Server-side rendered |
| AI Generator | ✅ Ready | Claude + Grok Aurora |
| GitHub Publish | ✅ Ready | Auto-commit MDX files |
| Newsletter | ✅ Ready | Resend integration |
| News Ticker | ✅ Ready | 3-row animated ticker |
| Terminal Design | ✅ Live | Complete design system |

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Manual
```bash
npm run build
# Or use Vercel CLI:
vercel --prod
```

---

## 📝 Creating Content

### New Blog Post

**Option 1: AI Generator (Admin)**
1. Visit `/admin/ai-generator`
2. Enter topic and select category
3. Generate with Claude
4. Auto-publish to GitHub or download MDX

**Option 2: Manual MDX**
```mdx
---
title: "Your Post Title"
date: "2024-03-14"
excerpt: "Short description"
category: "Docker"
tags: ["docker", "tutorial"]
author: "Your Name"
---

# Content here...
```

Save to `content/posts/your-post.mdx`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📜 License

MIT License - see LICENSE file

---

## 🔗 Links

- **Live Site:** https://bedcave.com
- **GitHub:** https://github.com/Tripleiks/bedcave-frontend

---

> Built with 💙 for the homelab and DevOps community
