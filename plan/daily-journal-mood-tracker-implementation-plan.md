# Daily Journal + Mood Tracker Implementation Plan

Discovery mode: solution-shaping.

Source of truth:

- Product reference: `daily-journal-mood-tracker-docs.md`
- Agent rules: `AGENTS.md`
- Current repo state: Next.js starter using `next@16.2.7`, React 19, TypeScript,
  Tailwind CSS 4, root-level `app/`

Important adaptation:

- The reference document mentions Next.js 14 and Anthropic Claude. For this repo,
  implement against installed Next.js 16 local docs and use Google Gemini with
  `API_KEY_GEMINI`.
- The reference document shows `src/app/`, but this repo currently uses
  root-level `app/`. Keep root-level `app/` unless a separate migration is
  requested.

## Current Context

The repository is still near the default Next.js starter state:

- Existing app files: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Existing config: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`,
  `postcss.config.mjs`
- Existing dependencies: `next`, `react`, `react-dom`, TypeScript, ESLint, and
  Tailwind CSS 4
- Missing planned app layers: Prisma, auth, shadcn/ui, journal pages, dashboard,
  AI integration, API routes, server actions, and shared domain modules

## Product Objective

Build a private daily journaling web app where a user can write daily entries,
choose a mood, receive AI-generated summary and sentiment analysis, and review
weekly mood trends through a dashboard.

Core value loop:

1. User writes an entry and selects a mood.
2. App saves entry safely.
3. Gemini analyzes content and returns summary, sentiment, and keywords.
4. Dashboard updates stats, streak, recent entries, and mood chart.

## Target Users

Primary user:

- Individual user who wants a private, low-friction daily journaling habit.
- Trigger: end of day reflection, emotional check-in, or weekly mood review.
- Desired outcome: capture thoughts quickly and understand emotional patterns
  over time.

Secondary admin/developer user:

- Maintains the app, database, auth, AI cost controls, and deployment settings.

## Implementation Principles

- Keep journal data private and scoped to the authenticated user.
- Save user content before attempting AI processing.
- AI failures must not cause entry creation to fail.
- Use Indonesian UI copy by default.
- Prefer server-side data access and server actions where Next.js 16 docs
  recommend them.
- Validate all writes with Zod.
- Keep implementation slices small and verifiable.
- Use root-level folders that match this repo, not the `src/` layout from the
  reference document.

## Proposed Folder Structure

Create these folders as features are implemented:

```text
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  dashboard/
    page.tsx
    loading.tsx
  journal/
    page.tsx
    new/page.tsx
    [id]/page.tsx
    [id]/edit/page.tsx
  api/
    journal/route.ts
    journal/[id]/route.ts
    ai/summarize/route.ts
    dashboard/mood-chart/route.ts
components/
  ui/
  journal/
  dashboard/
  ai/
  layout/
lib/
  prisma.ts
  ai.ts
  utils.ts
  validators.ts
  constants.ts
actions/
  journal.ts
  ai.ts
hooks/
types/
prisma/
  schema.prisma
```

## Phase 0: Version And Tooling Alignment

Goal: prepare the repo for implementation without fighting framework version
drift.

Tasks:

- Read local Next.js docs before App Router, server action, route handler,
  caching, and form implementation:
  - `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- Confirm Tailwind CSS 4 setup in `app/globals.css` and `postcss.config.mjs`.
- Decide whether shadcn/ui will be initialized against Tailwind 4 and current
  Next.js layout.
- Add baseline `lib/utils.ts` only when shadcn/ui or `cn()` is needed.

Dependencies to add when implementation begins:

```bash
npm install prisma @prisma/client
npm install @google/generative-ai
npm install recharts zod bcryptjs next-auth @auth/prisma-adapter date-fns lucide-react framer-motion next-themes
npm install -D @types/bcryptjs
```

Completion criteria:

- Dependency list is installed only when used.
- App still runs with `npm run dev`.
- `npm run lint` passes after the first setup slice.

## Phase 1: Data Foundation

Goal: create the persistent model for users, entries, mood scores, and AI
results.

Tasks:

- Initialize Prisma with SQLite:
  - `npx prisma init --datasource-provider sqlite`
- Set `.env.local`:
  - `DATABASE_URL="file:./dev.db"`
  - `API_KEY_GEMINI="..."`
  - `NEXTAUTH_SECRET="..."`
  - `NEXTAUTH_URL="http://localhost:3000"`
- Create Prisma models:
  - `User`
  - `JournalEntry`
  - `Mood`
- Add indexes:
  - `[userId, journalDate]`
  - `[userId, mood]`
- Add Prisma singleton in `lib/prisma.ts`.
- Add shared mood constants in `lib/constants.ts`.
- Add Zod schemas in `lib/validators.ts`.

Required mood mapping:

| Mood | Score | UI color intent |
| --- | ---: | --- |
| `TERRIBLE` | 1 | red |
| `BAD` | 2 | orange |
| `NEUTRAL` | 3 | yellow |
| `GOOD` | 4 | emerald |
| `AMAZING` | 5 | violet |

Validation rules:

- `title`: required, max 200 chars
- `content`: required, max 10000 chars
- `mood`: required enum value
- `tags`: optional, max 500 chars
- `journalDate`: required date string

Completion criteria:

- `npx prisma db push` succeeds.
- `npx prisma generate` succeeds.
- Database can store a user and journal entry with mood and AI fields.

## Phase 2: Authentication And Privacy Boundary

Goal: make journal data private and user-scoped.

Tasks:

- Add auth with NextAuth and Prisma adapter, or the current best auth setup
  supported by installed Next.js docs and package compatibility.
- Implement credentials-based login/register if matching the reference document.
- Hash passwords with `bcryptjs`.
- Add auth route under `app/api/auth/[...nextauth]/route.ts` if using NextAuth.
- Add login and register pages under `app/(auth)/`.
- Add helper to get the current session/user server-side.
- Protect dashboard and journal routes.
- Ensure every journal query filters by `userId`.

Completion criteria:

- User can register and log in.
- Logged-out users cannot access journal/dashboard pages.
- One user cannot read or mutate another user's entries.
- No route or action uses a fake `current-user-id`.

## Phase 3: Journal CRUD Vertical Slice

Goal: implement the main writing workflow before AI and chart polish.

Tasks:

- Create server actions in `actions/journal.ts`:
  - `createJournalEntry`
  - `updateJournalEntry`
  - `deleteJournalEntry`
- Create route handlers where external/client fetching is needed:
  - `GET /api/journal`
  - `POST /api/journal`
  - `GET /api/journal/[id]`
  - `PUT /api/journal/[id]`
  - `DELETE /api/journal/[id]`
- Implement journal UI components:
  - `components/journal/mood-selector.tsx`
  - `components/journal/journal-editor.tsx`
  - `components/journal/journal-card.tsx`
  - `components/journal/journal-detail.tsx`
- Implement pages:
  - `app/journal/page.tsx`
  - `app/journal/new/page.tsx`
  - `app/journal/[id]/page.tsx`
  - `app/journal/[id]/edit/page.tsx`

Journal list behavior:

- Pagination: default page `1`, default limit `10`
- Filters: `mood`, `startDate`, `endDate`
- Search: title and content

New entry behavior:

- Mood selector with five clear options
- Title input
- Large writing area
- Optional tags
- Date picker with today as default
- Save button with loading and disabled states

Completion criteria:

- User can create, view, edit, delete, search, and filter own entries.
- Mood score is derived from mood enum consistently.
- Revalidation updates journal list and dashboard paths.
- Empty, loading, and error states exist.

## Phase 4: Gemini AI Summary And Sentiment

Goal: add AI analysis that enriches entries without risking data loss.

Tasks:

- Install Gemini SDK: `@google/generative-ai`.
- Implement `lib/ai.ts` as a server-only Gemini wrapper.
- Use `process.env.API_KEY_GEMINI`.
- Define `analyzeJournalEntry(content)` returning:
  - `summary`
  - `sentimentScore`
  - `sentimentLabel`
  - `keywords`
- Validate parsed AI output with Zod before database update.
- Implement `actions/ai.ts`:
  - `generateAiSummary(entryId)`
- Implement `POST /api/ai/summarize` if a route endpoint is still needed.
- Add AI display components:
  - `components/ai/ai-summary-card.tsx`
  - `components/ai/sentiment-badge.tsx`

Prompt requirements:

- Summary must be 2-3 concise sentences.
- Summary language should match the entry language.
- Sentiment score range is `-1.0` to `1.0`.
- Sentiment label must be `positive`, `neutral`, or `negative`.
- Keywords should be 3-5 terms.
- Response should be strict JSON only.

Failure behavior:

- Entry creation succeeds even if Gemini fails.
- Store no partial invalid AI output.
- Show pending or failed AI state in entry detail.
- Allow retrying analysis from entry detail or server action.

Completion criteria:

- New entries can trigger Gemini analysis.
- AI fields are saved to the correct journal entry.
- Journal detail shows summary, sentiment, and keywords.
- AI key never appears in client bundles or logs.

## Phase 5: Dashboard And Mood Visualization

Goal: let users understand recent writing and mood trends.

Tasks:

- Implement dashboard route: `app/dashboard/page.tsx`.
- Implement dashboard loading skeleton: `app/dashboard/loading.tsx`.
- Implement API route: `GET /api/dashboard/mood-chart?days=7`.
- Implement dashboard components:
  - `components/dashboard/mood-chart.tsx`
  - `components/dashboard/streak-counter.tsx`
  - `components/dashboard/stats-cards.tsx`
- Use Recharts for mood visualization.
- Show recent 5 entries.
- Add quick add action to `/journal/new`.

Dashboard data contract:

```json
{
  "data": [
    { "date": "2026-05-19", "avgMood": 3.5, "entries": 2 },
    { "date": "2026-05-20", "avgMood": 4.0, "entries": 1 },
    { "date": "2026-05-21", "avgMood": null, "entries": 0 }
  ],
  "summary": {
    "avgMood": 3.8,
    "totalEntries": 12,
    "streak": 5,
    "dominantMood": "GOOD"
  }
}
```

Rules:

- Default chart range is 7 days.
- Support 14 and 30 days in UI when simple.
- Cap API range at 90 days.
- Preserve days without entries with `avgMood: null`.
- Calculate streak based on consecutive journal dates, not created timestamps.

Completion criteria:

- Dashboard renders stats, chart, streak, recent entries, and quick add.
- Missing days render as gaps or neutral empty points without false data.
- Dashboard only uses current user's entries.

## Phase 6: Layout, Navigation, And Theming

Goal: make the app feel cohesive and useful for daily use.

Tasks:

- Build layout components:
  - `components/layout/sidebar.tsx`
  - `components/layout/header.tsx`
  - `components/layout/theme-toggle.tsx`
  - mobile bottom navigation when needed
- Add route-aware navigation for dashboard and journal.
- Add dark mode via `next-themes` when theme infrastructure is ready.
- Style with Tailwind and shadcn/ui components.
- Add icons via `lucide-react`.

Design direction:

- Calm and personal.
- Indonesian copy.
- Neutral surfaces balanced with mood-specific colors.
- Purple may be an accent, but avoid a one-color purple UI.
- Comfortable writing space and readable journal detail.
- Use compact, repeated cards for entries and stats.

Completion criteria:

- Desktop has clear sidebar navigation.
- Mobile has ergonomic navigation.
- Theme toggle works and persists.
- Text does not overflow buttons, cards, or filters.

## Phase 7: Polish And Enhancements

Goal: complete the user experience after the core loop works.

Tasks:

- Add toast notifications for save, delete, and AI states.
- Add skeletons and loading states for dashboard and journal list.
- Add confirmation dialog for delete.
- Add markdown rendering for journal detail if markdown support is in scope.
- Add tag filter and tag display.
- Add page transitions with Framer Motion where they do not hurt usability.
- Add export options:
  - Markdown export
  - PDF export later
- Add calendar view later for mood-by-day browsing.
- Consider PWA support after core app is stable.

Completion criteria:

- Common slow and failed states are handled.
- Destructive actions are confirmable.
- Tags improve browsing without complicating entry creation.

## Phase 8: Production Readiness

Goal: prepare the app for deployment and safer operation.

Tasks:

- Migrate database from SQLite to PostgreSQL for production if deploying.
- Choose hosted database such as Supabase or Neon.
- Configure production environment variables.
- Add rate limiting for AI endpoints/actions.
- Add AI cost and content-size guards.
- Review logging to avoid leaking private journal content.
- Deploy to Vercel or chosen platform.
- Run build and smoke tests.

Completion criteria:

- `npm run lint` passes.
- `npm run build` passes.
- Production env variables are documented.
- AI usage is bounded and server-only.
- Deployment can create, analyze, and display entries.

## API Contract Summary

### `GET /api/journal`

Query:

- `page`: default `1`
- `limit`: default `10`
- `mood`: optional mood enum
- `startDate`: optional date
- `endDate`: optional date
- `search`: optional keyword search

Returns:

- `entries`
- `pagination.total`
- `pagination.page`
- `pagination.limit`
- `pagination.totalPages`

### `POST /api/journal`

Body:

```json
{
  "title": "Hari yang Produktif",
  "content": "Hari ini saya berhasil menyelesaikan...",
  "mood": "GOOD",
  "tags": "kerja,produktif",
  "journalDate": "2026-05-25"
}
```

Rules:

- Validate with Zod.
- Derive `moodScore`.
- Scope to current user.
- Trigger AI after save.

### `POST /api/ai/summarize`

Body:

```json
{
  "entryId": "entry-id"
}
```

Rules:

- Look up entry by `entryId` and current `userId`.
- Analyze saved content using Gemini.
- Save validated result.
- Revalidate entry detail and dashboard.

### `GET /api/dashboard/mood-chart`

Query:

- `days`: default `7`, max `90`

Returns daily mood data and summary stats.

## Data Model Summary

```prisma
model User {
  id           String         @id @default(cuid())
  name         String?
  email        String         @unique
  passwordHash String
  avatarUrl    String?
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  entries      JournalEntry[]
}

model JournalEntry {
  id             String   @id @default(cuid())
  title          String
  content        String
  mood           Mood
  moodScore      Int
  tags           String?
  aiSummary      String?
  sentimentScore Float?
  sentimentLabel String?
  keywords       String?
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  journalDate    DateTime @default(now())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([userId, journalDate])
  @@index([userId, mood])
}

enum Mood {
  TERRIBLE
  BAD
  NEUTRAL
  GOOD
  AMAZING
}
```

## Recommended Build Order

1. Version/tooling alignment and dependency installation.
2. Prisma schema, validators, constants, and Prisma singleton.
3. Auth and user scoping.
4. Journal create/list/detail without AI.
5. Journal edit/delete/search/filter.
6. Gemini AI analysis and AI summary UI.
7. Dashboard stats and mood chart.
8. Layout, responsive navigation, dark mode.
9. Polish, export, calendar, production readiness.

This order protects the main user value loop while keeping each step testable.

## Verification Checklist

Run as relevant after each slice:

- `npm run lint`
- `npm run build`
- `npx prisma generate`
- `npx prisma db push`
- Manual flow: register, login, create entry, view entry, edit entry, delete
  entry
- Manual AI flow: create entry, confirm Gemini result saved, retry failed AI
  analysis
- Manual dashboard flow: create entries across several dates, confirm stats,
  streak, missing days, and mood chart
- Privacy check: user A cannot access user B entry by URL or API

## Key Risks

- Next.js reference drift: the source document targets Next.js 14, but this repo
  uses Next.js 16. Always prefer local docs.
- Tailwind/shadcn compatibility: shadcn setup must match Tailwind 4 and current
  project layout.
- Auth package compatibility: verify NextAuth behavior with React 19 and Next.js
  16 before building too much on top of it.
- AI reliability: Gemini can return malformed JSON or fail. Validate output and
  keep entry creation independent.
- Privacy: journal text is sensitive. Avoid logging full content or prompts.
- Scope creep: export, calendar, PWA, and production DB migration should wait
  until the core loop is stable.

## Assumptions

- The app is for single-user accounts with private data, not shared journals.
- Indonesian is the default UI language.
- SQLite is acceptable for local development.
- Gemini is the chosen AI provider and the key name is `API_KEY_GEMINI`.
- Root-level `app/` remains the project structure.

## Open Questions

- Should auth be required in the first working slice, or can local demo mode be
  built first with a seeded user?
- Which Gemini model should be used for production cost and quality balance?
- Should tags remain comma-separated strings, or become a normalized table later?
- Should markdown support include preview/edit modes or only rendered detail?
- Should AI analysis run immediately in the request, in a background job, or by
  explicit retry button after entry save?

## Next Step

Use this plan as the implementation backlog. The best follow-up is
`tech-plan-lite` for the first vertical slice: Prisma schema, validators,
Gemini wrapper, and journal create/detail flow.
