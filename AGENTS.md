# Content Engine - AI Coding Agent Guide

## Project Overview

Content Engine is an AI-powered content automation platform for X/Twitter. It provides a chat-based interface for content creation, knowledge base management, scheduling, and social media publishing.

**Key Features:**
- AI-powered content generation with customizable instructions
- Knowledge base ("Brain") for storing brand voice and reference materials
- Content queue for scheduling and managing posts
- Social media connections (X/Twitter supported, more platforms planned)
- Twitter/X scraping for research and competitor analysis

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (New York style) |
| Font | Geist (Google Fonts) |
| Database | Supabase |
| Job Queue | BullMQ |
| External APIs | Apify (Twitter scraping), Kimi (AI generation) |
| Build Compiler | React Compiler (Babel) |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main Agent chat interface (default route)
│   ├── layout.tsx         # Root layout with sidebar
│   ├── globals.css        # Global styles, Tailwind theme variables
│   ├── brain/page.tsx     # Knowledge base / document uploads
│   ├── queue/page.tsx     # Content queue management
│   ├── connections/page.tsx  # Social platform connections
│   ├── schedules/page.tsx    # Post scheduling configuration
│   ├── instructions/page.tsx # Custom AI instructions
│   └── settings/page.tsx     # User settings and API keys
├── components/
│   ├── sidebar.tsx        # Navigation sidebar component
│   └── ui/                # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── badge.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── tooltip.tsx
│       └── avatar.tsx
└── lib/
    ├── utils.ts           # Utility functions (cn for class merging)
    ├── supabase.ts        # Supabase client configuration
    ├── apify.ts           # Apify Twitter scraper integration
    └── test-apify.ts      # Test script for Apify integration
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Server runs at http://localhost:3000

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint
```

## Code Style Guidelines

### File Naming
- Components: PascalCase (e.g., `Sidebar.tsx`)
- Utilities/pages: camelCase or kebab-case (e.g., `utils.ts`, `test-apify.ts`)

### Import Conventions
- Use path aliases defined in `tsconfig.json`:
  - `@/components/*` for components
  - `@/lib/*` for utilities
  - `@/hooks/*` for custom hooks

### Component Patterns
- Functional components with TypeScript
- Use `React.ComponentProps<"element">` for HTML prop types
- Use `cn()` utility for conditional class merging
- Dark theme by default (set in `layout.tsx`: `<html className="dark">`)

### Styling Conventions
- Tailwind CSS with zinc color palette for dark UI
- Use theme CSS variables for colors (e.g., `bg-zinc-950`, `text-zinc-500`)
- Card backgrounds: `bg-zinc-900`
- Borders: `border-zinc-800`
- Primary action color: `bg-blue-600 hover:bg-blue-700`

### Example Component Structure
```tsx
"use client";  // For client components

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  // Define props
}

export default function ComponentName({ className }: Props) {
  return (
    <div className={cn("base-classes", className)}>
      {/* Content */}
    </div>
  );
}
```

## Environment Variables

Create `.env.local` file with the following variables:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External APIs (required for full functionality)
APIFY_TOKEN=apify_api_...           # For Twitter/X scraping
KIMI_API_KEY=sk-kimi-...            # For AI content generation
```

**Security Note:** Never commit `.env.local` to git. It's already in `.gitignore`.

## Key Integrations

### Supabase
- Client-side: Uses anon key (`supabase` export)
- Server-side: Uses service role key (`createServerClient()`)
- Located in: `src/lib/supabase.ts`

### Apify Twitter Scraper
- Scrapes tweets without X credentials
- Cost: ~$0.25 per 1,000 tweets
- Rate: ~60 tweets/second
- Functions: `scrapeTweets()`, `scrapeWithEngagement()`
- Located in: `src/lib/apify.ts`

### Kimi AI
- Used for content generation
- API key configured in settings

## Testing

### Apify Integration Test
Run the Apify test script:
```bash
npx tsx src/lib/test-apify.ts
```

This tests:
- Basic tweet scraping
- Engagement filtering
- Engagement score calculation

**Note:** Requires `APIFY_TOKEN` to be set in environment.

### No Formal Test Framework
The project currently does not have Jest, Vitest, or other test frameworks configured. Add tests in `src/__tests__/` if implementing a testing strategy.

## Routing Structure

| Route | Page | Description |
|-------|------|-------------|
| `/` | Agent | Main chat interface for content creation |
| `/queue` | Queue | Manage scheduled and pending posts |
| `/brain` | Brain | Knowledge base for training AI voice |
| `/connections` | Connections | Social media account connections |
| `/schedules` | Schedules | Configure posting schedules |
| `/instructions` | Custom Instructions | AI tone/style configuration |
| `/settings` | Settings | Profile and API key management |

## UI Components (shadcn/ui)

Components are located in `src/components/ui/` and follow shadcn/ui patterns:

- Use `cva` (class-variance-authority) for variant management
- Use `radix-ui` for accessible primitives
- Support `asChild` prop for composition
- Use `data-slot` attributes for styling hooks

### Available Components
- `Button` - Primary actions, multiple variants (default, outline, ghost, etc.)
- `Card` - Content containers with header/content/footer
- `Input` - Form text inputs
- `Textarea` - Multi-line text inputs
- `Badge` - Status labels
- `ScrollArea` - Custom scrollable containers
- `Separator` - Visual dividers
- `Tooltip` - Hover information
- `Avatar` - User profile images

## State Management

- **Local state:** React `useState` for component-level state
- **No global state:** Redux, Zustand, or Context not yet implemented
- **Server state:** Supabase for persistent data

## Security Considerations

1. **API Keys:** Store in `.env.local`, never expose service role keys client-side
2. **Supabase:** Use anon key for client, service role only server-side
3. **Input Validation:** Add validation before sending data to external APIs
4. **CORS:** Configure CORS in Supabase for production domains

## Deployment

The project is configured for Vercel deployment:

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with `git push`

**Build Output:** Static + Server-side rendering (Next.js default)

## Common Development Tasks

### Adding a New Page
1. Create `src/app/new-page/page.tsx`
2. Add link to `src/components/sidebar.tsx`
3. Follow existing page structure with header and Card components

### Adding a UI Component
1. Use shadcn/ui CLI or copy existing component pattern
2. Place in `src/components/ui/`
3. Export from component file
4. Use `cn()` for class merging

### Adding an External API Integration
1. Create new file in `src/lib/`
2. Export typed functions
3. Use environment variables for API keys
4. Add error handling for API failures

## Known Limitations

- AI integration is placeholder (marked "coming in Sprint 3")
- Only X/Twitter connection is implemented (LinkedIn, Threads, BlueSky planned)
- No formal test suite implemented
- Queue and Brain pages are UI shells without backend integration
