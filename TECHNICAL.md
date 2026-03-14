# TECHNICAL DOCUMENTATION - BEDCAVE

> Comprehensive technical documentation for developers and contributors

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Next.js   │  │ Tailwind CSS│  │ Framer Motion   │  │
│  │  App Router │  │   Styling   │  │   Animation     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    API LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ /api/ai/    │  │ /api/github/│  │ /api/newsletter/│  │
│  │  generate   │  │   publish   │  │   subscribe     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   SERVICE LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Claude    │  │   Grok      │  │    Resend       │  │
│  │   (Anthropic)│  │   Aurora    │  │   (Email)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    MDX      │  │   GitHub    │  │   Resend        │  │
│  │   Files     │  │    API      │  │   Audience      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Routes

### `/api/ai/generate` - AI Blog Generation

**Method:** POST

**Request Body:**
```json
{
  "prompt": "Docker Compose tutorial",
  "category": "Docker"
}
```

**Response:**
```json
{
  "title": "Docker Compose for Beginners",
  "excerpt": "Learn how to...",
  "content": "# Full markdown content...",
  "tags": ["docker", "tutorial"],
  "keywords": ["docker compose", "containers"]
}
```

**Features:**
- Uses Claude API (`claude-sonnet-4-6`)
- 8192 max_tokens
- Robust JSON parsing with brace counting
- Content separated from metadata (CONTENT_START/CONTENT_END)
- 1200-1500 word generation

**Environment Variables:**
- `ANTHROPIC_API_KEY`

---

### `/api/unsplash/search` - Image Generation (Grok Aurora)

**Method:** GET

**Query Parameters:**
- `query` - Search term (article title)
- `orientation` - Image orientation

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "url": "https://...",
    "thumb": "https://...",
    "author": "Grok Aurora AI"
  }
}
```

**Features:**
- Grok Aurora AI image generation
- Uses article title as prompt
- Returns direct image URL

**Environment Variables:**
- `XAI_API_KEY`

---

### `/api/github/publish` - Auto-Publish to GitHub

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

**Response:**
```json
{
  "success": true,
  "filename": "content/posts/article-title.mdx",
  "commitSha": "..."
}
```

**Process:**
1. Generate slug from title
2. Create MDX content with frontmatter
3. Get latest branch reference
4. Create blob with file content
5. Create new tree
6. Create commit
7. Update branch reference

**Environment Variables:**
- `GITHUB_TOKEN` (needs `repo` scope)
- `GITHUB_REPO` (default: "Tripleiks/bedcave-frontend")
- `GITHUB_BRANCH` (default: "main")

---

### `/api/newsletter/subscribe` - Newsletter Signup

**Method:** POST

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed!",
  "data": { ... }
}
```

**Features:**
- Email validation
- Resend contact creation
- Welcome email with HTML template
- Double opt-in ready

**Environment Variables:**
- `RESEND_API_KEY`
- `RESEND_AUDIENCE_ID`

---

## 🧩 Component Architecture

### Core Components

#### `HeroSection`
- Wavy background animation
- Glitch text effect
- Animated category cards
- Scroll indicator
- Responsive grid layout

#### `HomeContent`
- Newsletter state management
- Subscribe handler with API integration
- Dashboard components
- Posts grid layout

#### `NewsTicker`
- 3-row infinite scrolling
- Different directions per row
- Varying scroll speeds
- Category icons and colors
- NEW badges for recent items

#### `ArticleCard`
- Variant: default/featured
- Hover animations
- Category badges
- Date formatting

### Dashboard Components

#### `SystemStats`
- Live CPU/RAM simulation (randomized)
- Container count display
- Uptime counter
- Animated updates every 3s

#### `TypingCommand`
- Cycling commands
- Typewriter effect
- Blinking cursor
- 6 pre-defined commands

#### `DigitalClock`
- Real-time updates
- ISO date format
- 1s refresh interval

#### `QuoteTicker`
- 6 tech quotes
- 5s rotation interval
- Fade animations

#### `TechStackPills`
- 5 technology badges
- Staggered animation
- Hover effects

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--color-cyan: #00d4ff;      /* Primary actions, Docker */
--color-green: #39ff14;     /* Success, Hardware */
--color-pink: #ff006e;      /* Hardware category */
--color-yellow: #ffbe0b;    /* Warnings, Homelab */
--color-purple: #8338ec;    /* Secondary, Azure */

/* Category Colors */
--docker: #2496ed;
--unraid: #ff6c00;
--homelab: #e57000;
--m365: #0078d4;
--azure: #0089d6;

/* UI Colors */
--bg-primary: #0a0a0f;
--bg-secondary: #13131f;
--border: #1e293b;
--text-primary: #e2e8f0;
--text-secondary: #64748b;
```

### Typography

```css
/* Font Family */
font-family: 'JetBrains Mono', 'Fira Code', monospace;

/* Sizes */
--text-xs: 0.75rem;     /* 12px - Labels */
--text-sm: 0.875rem;    /* 14px - Code */
--text-base: 1rem;      /* 16px - Body */
--text-lg: 1.125rem;    /* 18px - Subheadings */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px - Headings */
```

### Spacing & Layout

```css
/* Container */
max-width: 1280px;
padding: 16px (mobile) / 24px (tablet) / 32px (desktop);

/* Grid */
grid-cols-1 (mobile)
grid-cols-2 (tablet)
grid-cols-3 (desktop)
grid-cols-4 (large)

/* Gaps */
gap-4: 16px
gap-6: 24px
gap-8: 32px
```

---

## 🔌 Integration Points

### AI Generation Flow

```
User Input → Claude API → JSON Parse → Content Extract
                                    ↓
                              ┌─────────────┐
                              │  MDX Format │
                              └─────────────┘
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              GitHub API      Download MDX    Display Preview
                    ↓
              Auto-Commit
```

### Newsletter Flow

```
User Email → Validation → Resend API → Contact Created
                                          ↓
                                    Welcome Email
                                          ↓
                                    Audience List
```

### News Ticker Flow

```
Static Data → Framer Motion → Infinite Loop
                   ↓
              3 Rows × Different Speeds
                   ↓
              Seamless Animation
```

---

## 🛡️ Error Handling

### API Error Patterns

```typescript
// Standardized error response
{
  error: string;
  status: number;
}

// Client-side handling
try {
  const response = await fetch('/api/...');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  return await response.json();
} catch (error) {
  // Display user-friendly message
  setError(error.message);
}
```

### Validation

- **Email:** Regex pattern + @ check
- **API Keys:** Presence check before API calls
- **JSON Parsing:** Try-catch with fallback

---

## 🚀 Deployment Checklist

### Pre-Deploy

- [ ] All environment variables set in Vercel
- [ ] GitHub token has `repo` scope
- [ ] Resend domain verified (optional but recommended)
- [ ] Dependencies installed (`npm ci`)
- [ ] Build succeeds locally (`npm run build`)

### Post-Deploy

- [ ] Homepage loads correctly
- [ ] AI generator accessible at `/admin/ai-generator`
- [ ] Newsletter signup works
- [ ] News ticker animates
- [ ] Mobile responsive

---

## 🔧 Development Tips

### Adding New API Route

1. Create file: `src/app/api/new-feature/route.ts`
2. Export `GET|POST|PUT|DELETE` functions
3. Add error handling
4. Update environment types if needed
5. Document in this file

### Adding New Component

1. Create in `src/components/`
2. Use TypeScript interfaces
3. Follow existing naming convention
4. Add to appropriate page/section
5. Test responsive behavior

### Adding New Post

**Via AI Generator:**
1. Navigate to `/admin/ai-generator`
2. Enter prompt
3. Select category
4. Generate content
5. Publish or download

**Manually:**
1. Create MDX in `content/posts/`
2. Add frontmatter
3. Write content
4. Commit to GitHub
5. Auto-deploy via Vercel

---

## 📊 Performance Considerations

### Optimizations

- **SSG:** Blog posts pre-rendered at build time
- **ISR:** Optional for dynamic content
- **Images:** Next.js Image optimization
- **Fonts:** Next/font for Geist
- **CSS:** Tailwind purging unused styles

### Bundle Size

```bash
# Analyze bundle
npm run analyze
```

### Lighthouse Targets

- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

---

## 🔐 Security Notes

### API Keys
- Never commit `.env.local`
- Use Vercel environment variables
- Rotate keys regularly
- Use least-privilege tokens

### GitHub Token
- Scope: `repo` only
- No admin permissions needed
- Personal Access Token (classic) or Fine-grained

### Resend
- Domain verification recommended
- Use audience-specific keys
- Monitor sending limits

---

## 📝 Changelog Format

```
## [Version] - YYYY-MM-DD

### Added
- New feature

### Changed
- Modification

### Fixed
- Bug fix

### Removed
- Deprecated feature
```

---

## 🤝 Contributing Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Semantic HTML
- Accessible components
- Mobile-first responsive

### Commit Messages
```
feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructuring
test: Testing
chore: Maintenance
```

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Claude API](https://docs.anthropic.com/)
- [Grok Aurora](https://x.ai/api)
- [Resend](https://resend.com/docs)

---

> Last Updated: 2024-03-14
> Version: 1.0.0
