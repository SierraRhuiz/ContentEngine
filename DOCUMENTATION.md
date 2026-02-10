# Content Engine - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [Pages & Routes](#pages--routes)
6. [Components](#components)
7. [API Routes](#api-routes)
8. [External Integrations](#external-integrations)
9. [Authentication](#authentication)
10. [Environment Variables](#environment-variables)
11. [Development](#development)

---

## Project Overview

Content Engine is an AI-powered content automation platform for X/Twitter and other social platforms. It provides:

- **AI Chat Interface** - Create content through conversational AI (Kimi K2.5)
- **Unified Feed** - Monitor Twitter/LinkedIn accounts for content inspiration
- **Knowledge Base (Brain)** - Store brand voice and reference materials
- **Content Queue** - Schedule and manage posts
- **Voice Profile Extraction** - Analyze your posts to create a unique writing style
- **Multi-Platform Scraping** - Twitter, LinkedIn, YouTube, and blog content

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui + Radix UI | 1.4.3 |
| Database | Supabase | 2.94.0 |
| Auth | Supabase Auth | via @supabase/ssr |
| AI Provider | Moonshot AI (Kimi K2.5) | - |
| Scraping | Apify | - |
| Icons | Lucide React | 0.563.0 |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── globals.css                # Global styles, Tailwind theme
│   ├── (auth)/                    # Authentication pages (public)
│   │   ├── layout.tsx             # Centered auth layout
│   │   ├── login/page.tsx         # Login page
│   │   ├── signup/page.tsx        # Sign up page
│   │   ├── reset-password/page.tsx
│   │   └── update-password/page.tsx
│   ├── (protected)/               # Protected app pages
│   │   ├── layout.tsx             # Sidebar + auth check layout
│   │   ├── page.tsx               # Agent (AI Chat) - main page
│   │   ├── feed/page.tsx          # Unified Feed monitoring
│   │   ├── queue/page.tsx         # Content queue management
│   │   ├── brain/page.tsx         # Knowledge base / sources
│   │   ├── connections/page.tsx   # Social platform connections
│   │   ├── schedules/page.tsx     # Posting schedules config
│   │   ├── instructions/page.tsx  # Custom AI instructions
│   │   └── settings/page.tsx      # User settings & API keys
│   └── api/
│       ├── chat/route.ts          # AI chat completions (Kimi)
│       ├── scrape/route.ts        # Multi-platform scraping
│       ├── queue/route.ts         # Queue management
│       └── feed/                   # Feed-related endpoints
│           ├── route.ts
│           ├── accounts/route.ts
│           ├── blogs/route.ts
│           ├── historical/route.ts
│           ├── scheduler/route.ts
│           └── tone/route.ts
├── components/
│   ├── sidebar.tsx                # Main navigation sidebar
│   ├── auth/
│   │   ├── auth-provider.tsx      # AuthContext with Supabase
│   │   └── login-form.tsx         # Login form component
│   ├── feed/
│   │   ├── AccountSidebar.tsx     # Account list for feed
│   │   ├── PostCard.tsx           # Individual post display
│   │   ├── ToneMatchingPanel.tsx  # Voice profile panel
│   │   └── BlogSources.tsx        # Blog source management
│   └── ui/                        # shadcn/ui components
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── lib/
│   ├── utils.ts                   # Utility functions (cn)
│   ├── supabase.ts                # Client-side Supabase
│   ├── supabase-auth.ts           # Auth-specific Supabase client
│   ├── supabase-server.ts         # Server-side Supabase
│   ├── kimi.ts                    # Kimi AI API client
│   ├── apify.ts                   # Apify scraper integration
│   ├── queue.ts                   # Queue management utilities
│   └── hyperbrowser/index.ts      # Blog scraping utilities
├── middleware.ts                  # Auth middleware for routes
└── scripts/
    ├── feed-refresh.ts            # Cron job for feed refresh
    └── blog-refresh.ts            # Cron job for blog refresh
```

---

## Features

### 1. AI Agent Chat
- Real-time chat interface for content creation
- Two modes: **Writing** (create content) and **Research** (find inspiration)
- Pre-built recipe templates for common tasks
- Conversation history maintained per session
- Powered by Kimi K2.5 API

### 2. Unified Feed
- Monitor multiple Twitter and LinkedIn accounts
- Real-time post scraping via Apify
- Generate similar content from any post
- Save posts to queue for later
- Filter by platform or specific account
- Blog source integration for article inspiration

### 3. Voice Profile / Tone Matching
- Extract writing style from your own posts
- Analyze: tone, themes, vocabulary, patterns
- Apply voice profile to generated content
- Automatic re-analysis when posts are updated

### 4. Knowledge Base (Brain)
- Connect Twitter accounts for voice extraction
- Add websites/blogs to scrape
- Connect YouTube channels (transcript extraction)
- Connect LinkedIn profiles
- Upload documents (CSV, TXT, PDF)
- Displays extracted brand voice profile

### 5. Content Queue
- Draft, scheduled, and published post tracking
- Stats dashboard (pending/scheduled/published counts)
- Integration with AI generation

### 6. Connections
- X (Twitter) - Available
- LinkedIn - Coming soon
- Threads - Coming soon
- BlueSky - Coming soon

### 7. Schedules
- Configure posting days (Mon-Sun)
- Set posting times
- Timezone configuration

### 8. Custom Instructions
- Define tone & voice guidelines
- Set writing style rules
- Format rules (character limits, emoji usage)
- Things to avoid

---

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Agent | AI chat interface (main page) |
| `/feed` | Feed | Monitor Twitter/LinkedIn accounts |
| `/queue` | Queue | Manage scheduled posts |
| `/brain` | Brain | Knowledge base & voice training |
| `/connections` | Connections | Social media account connections |
| `/schedules` | Schedules | Configure posting schedules |
| `/instructions` | Instructions | AI tone/style configuration |
| `/settings` | Settings | Profile & API key management |
| `/login` | Login | User authentication |
| `/signup` | Sign Up | New user registration |
| `/reset-password` | Reset | Password reset request |
| `/update-password` | Update | Set new password |

---

## Components

### Core Components

#### `Sidebar` (`components/sidebar.tsx`)
Main navigation with:
- Logo and brand
- "Create a post" button
- Content section (Agent, Feed, Queue, Brain)
- Configuration section (Connections, Schedules, Instructions)
- Settings link

#### `AuthProvider` (`components/auth/auth-provider.tsx`)
React context providing:
- `user` - Current Supabase user
- `session` - Current session
- `profile` - User profile from `profiles` table
- `loading` - Auth state loading
- `signOut()` - Sign out function
- `refreshProfile()` - Refresh profile data

### Feed Components

#### `PostCard` (`components/feed/PostCard.tsx`)
Displays individual social media posts with:
- Author info (avatar, name, username)
- Post content
- Engagement stats (likes, comments, shares, views)
- Actions: Generate Similar, Save to Queue, View Original

#### `AccountSidebar` (`components/feed/AccountSidebar.tsx`)
Left sidebar for feed page:
- Platform filter (All, Twitter, LinkedIn)
- Add account form
- List of monitored accounts
- Refresh/remove account actions

#### `ToneMatchingPanel` (`components/feed/ToneMatchingPanel.tsx`)
Right sidebar panel showing:
- Extracted voice profile (tone, themes, vocabulary, patterns)
- Re-analyze button
- List of your recent posts

#### `BlogSources` (`components/feed/BlogSources.tsx`)
Blog management panel:
- Add blog URLs
- List scraped blogs
- Generate content from blogs

### UI Components (shadcn/ui)

| Component | Description |
|-----------|-------------|
| `Button` | Primary actions with variants (default, destructive, outline, secondary, ghost, link) |
| `Card` | Content containers with CardHeader, CardTitle, CardContent |
| `Input` | Form text inputs |
| `Textarea` | Multi-line text inputs |
| `Badge` | Status labels and tags |
| `ScrollArea` | Custom scrollable containers |
| `Separator` | Visual dividers |
| `Tooltip` | Hover information |
| `Avatar` | User profile images |

---

## API Routes

### POST `/api/chat`
AI chat completions using Kimi K2.5.

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "mode": "writing" | "research"
}
```

**Response:**
```json
{
  "content": "Generated response..."
}
```

### POST `/api/scrape`
Multi-platform content scraping.

**Request:**
```json
{
  "type": "twitter" | "linkedin" | "youtube" | "blog",
  "username": "elonmusk",
  "url": "https://...",
  "options": {
    "maxTweets": 100,
    "includeReplies": false,
    "includeRetweets": false
  }
}
```

**Response (Twitter):**
```json
{
  "tweets": [
    {
      "id": "...",
      "content": "Tweet text...",
      "author": "elonmusk",
      "likes": 1000,
      "retweets": 500,
      "comments": 100,
      "views": 50000,
      "timestamp": "2026-02-07T...",
      "url": "https://x.com/..."
    }
  ]
}
```

### POST `/api/queue`
Queue management for scheduled posts.

---

## External Integrations

### Kimi AI (Moonshot)
- **API:** `https://api.moonshot.ai/v1`
- **Model:** `kimi-k2.5`
- **Features:**
  - Chat completions
  - Voice profile extraction
  - Content generation with brand voice
  - Blog post generation from transcripts

**Key Functions (lib/kimi.ts):**
- `chat()` - Basic chat completion
- `generateWithVoice()` - Generate with brand voice profile
- `generateSimilarTweet()` - Create tweet inspired by source
- `extractVoiceProfile()` - Analyze tweets to extract voice
- `generateBlogPost()` - Create blog from key points
- `generateFromTranscript()` - Create content from video transcript

### Apify Scrapers
- **Twitter:** `kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest`
  - Cost: ~$0.25 per 1,000 tweets
  - Rate: ~60 tweets/second
- **YouTube:** `topaz_sharingan/youtube-transcript-scraper`
- **LinkedIn:** `curious_coder/linkedin-post-search-scraper`

**Key Functions (lib/apify.ts):**
- `getTwitterPosts()` - Scrape tweets from user
- `searchTwitterPosts()` - Search tweets by keyword
- `getYouTubeTranscript()` - Extract video transcript
- `getLinkedInPosts()` - Scrape LinkedIn posts
- `scrapeContent()` - Unified scraper for all platforms

### Supabase
- **Auth:** Email/password authentication
- **Database:** PostgreSQL for user profiles
- **Tables:** `profiles` (id, email, full_name, avatar_url, role)

---

## Authentication

### Flow
1. User visits protected route
2. Middleware checks for valid session
3. If no session, redirect to `/login`
4. After login, redirect to original route or `/`

### Protected Routes
All routes except:
- `/login`
- `/signup`
- `/reset-password`
- `/update-password`
- `/api/*`

### Auth Components
- `AuthProvider` - Wraps app with auth context
- `useAuth()` - Hook to access auth state
- `useRequireAuth()` - Hook that redirects if not authenticated

---

## Environment Variables

Create `.env.local` with:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (required for chat)
NEXT_PUBLIC_KIMI_API_KEY=sk-kimi-...

# Scraping (required for feed)
APIFY_TOKEN=apify_api_...
```

---

## Development

### Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Cron jobs
npm run cron:feed    # Refresh monitored accounts
npm run cron:blog    # Refresh blog sources
```

### Adding New Pages
1. Create `src/app/(protected)/new-page/page.tsx`
2. Add navigation link to `src/components/sidebar.tsx`
3. Follow existing page structure

### Adding UI Components
1. Use shadcn/ui CLI or copy existing pattern
2. Place in `src/components/ui/`
3. Use `cn()` for class merging

### Styling Conventions
- Dark theme by default
- Tailwind CSS with zinc color palette
- CSS variables for theming
- Card backgrounds: `bg-card`
- Borders: `border-border/50`
- Primary color: `bg-primary`

---

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Deployment

Configured for Railway/Vercel:

1. Connect repository
2. Set environment variables
3. Deploy with `git push`

**Config Files:**
- `railway.json` - Railway configuration
- `railway.toml` - Railway settings
