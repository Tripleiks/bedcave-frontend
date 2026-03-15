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
│  │ /api/ai/    │  │ /api/github/│  │ /api/images/    │  │
│  │  generate   │  │   publish   │  │   library       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ /api/news- │  │ /api/unsplash│  │                 │  │
│  │ letter/sub │  │   search    │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   SERVICE LAYER                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Perplexity │  │   Grok      │  │    Resend       │  │
│  │    AI      │  │   Aurora    │  │   (Email)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                   DATA LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    MDX      │  │   GitHub    │  │  JSON Library   │  │
│  │   Files     │  │    API      │  │   (Images)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Resend    │  │   Grok      │  │                 │  │
│  │  Audience   │  │   Images    │  │                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Routes

### `/api/ai/generate` - **AI Blog Generation**: Perplexity AI (`sonar-pro`) mit Quellenangaben

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
- Uses Perplexity API (`sonar-pro`)
- Real-time web search with source citations
- 4000 max_tokens
- Robust JSON parsing with brace counting
- Content separated from metadata (CONTENT_START/CONTENT_END)
- 1200-1500 word generation
- Automatic source attribution (copyright safe)

**Environment Variables:**
- `PERPLEXITY_API_KEY`

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
- **Auto-saves to library** - Every generated image stored in `content/images/library.json`

---

### `/api/images/library` - Image Library Management

**Methods:** GET, POST, DELETE

**GET - List Images:**
```bash
GET /api/images/library
GET /api/images/library?category=docker
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "id": "img_123",
      "url": "https://...",
      "title": "Docker Container",
      "prompt": "Professional tech blog cover...",
      "tags": ["docker", "containers"],
      "category": "docker",
      "createdAt": "2024-03-14T10:30:00Z",
      "usedInPosts": ["docker-tutorial"],
      "source": "grok-aurora"
    }
  ],
  "stats": {
    "totalImages": 5,
    "byCategory": { "docker": 2, "hardware": 1 }
  }
}
```

**POST - Add Image:**
```json
{
  "url": "https://...",
  "title": "Article Title",
  "prompt": "Prompt used",
  "tags": ["ai-generated"],
  "category": "docker",
  "source": "grok-aurora"
}
```

**DELETE - Remove Image:**
```bash
DELETE /api/images/library?id=img_123
```

**Storage:**
- JSON file: `content/images/library.json`
- Auto-created if doesn't exist
- Tracks usage in posts
- Categories: docker, unraid, homelab, hardware, m365, azure, general

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
- 3-row infinite scrolling with conditional rendering
- **Smart Fallback** - Automatically fills empty rows with fallback content
- **38 Curated Fallback Items** - Docker, Azure, M365, Homelab, Unraid, AI, GitHub, Tech
- **HackerNews API Integration** - Live tech news with intelligent categorization
- **AI Category** - Brain icon for AI/ML news (OpenAI, Claude, LLaMA, etc.)
- **Minimum 24 items guarantee** - 8 items per row, prevents empty rows
- Different directions per row
- Varying scroll speeds
- Category icons and colors
- NEW badges for recent items

#### `CloudStatusBanner`
- **4 Major Cloud Providers** - Azure, AWS, Google Cloud, Vercel
- **Real-time Status** - Live operational/degraded/outage indicators
- **Region Display** - European region focus
- **Latency Visualization** - Animated ping bars (4-bar signal strength)
- **Uptime Stats** - 99.9%+ uptime display
- **Pulsing Status Dots** - Framer Motion animations
- **Hover Effects** - Provider color glow on hover
- **Terminal Design** - Consistent site aesthetic

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
User Input → Perplexity API → JSON Parse → Content Extract + Sources
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
HackerNews API → Categorization → Mix with Fallback
                       ↓
              24 Items (8 per row)
                       ↓
              Framer Motion Loop
                       ↓
              3 Rows × Different Speeds
                       ↓
              Seamless Animation
```

### Cloud Status Banner Flow

```
Static Provider Data → Framer Motion Animations
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              Status Dots         Ping Bars
            (pulse animation)   (signal strength)
                    ↓                   ↓
              Grid Layout      Hover Glow Effects
```

### YouTube AI Videos Flow

```
YouTube Data API v3 → Multiple Targeted Searches
                              ↓
                    ┌─────────┴─────────┬─────────┐
                    ↓                   ↓         ↓
              Claude Code        Perplexity    Generative AI
                    ↓                   ↓         ↓
              Video Stats → Thumbnail Validation → Deduplication
                                                  ↓
                                        Categorization
                                                  ↓
                                        Top 10 by Views
                                                  ↓
                                        YouTubeCarousel Component
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
- [ ] News ticker animates (all 3 rows filled)
- [ ] Cloud Status Banner displays all providers
- [ ] YouTube AI Videos carousel loads with videos
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
- [Perplexity API](https://docs.perplexity.ai/)
- [Grok Aurora](https://x.ai/api)
- [Resend](https://resend.com/docs)

---

> Last Updated: 2025-03-15
> Version: 1.3.0
