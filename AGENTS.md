<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses the installed Next.js version, currently `next@16.2.7`. APIs,
conventions, and file structure may differ from older examples. Before writing
Next.js code, read the relevant guide in `node_modules/next/dist/docs/` and
heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Daily Journal + Mood Tracker Agent Rules

Use `daily-journal-mood-tracker-docs.md` as the main product reference for this
web app. Treat its feature direction as authoritative, but treat local package
versions and local Next.js docs as authoritative for implementation details.

## Product Goal

Build a private daily journaling web app with mood tracking, AI-generated entry
summaries, sentiment analysis, and weekly emotion visualization.

The core loop is:

1. The user writes a journal entry and chooses a mood.
2. The entry is saved to the database.
3. AI analysis generates a summary, sentiment score, sentiment label, and
   keywords.
4. Dashboard views show mood trends, streaks, recent entries, and summary stats.

## Expected Stack

- Next.js App Router with TypeScript.
- Tailwind CSS and shadcn/ui for UI components when installed.
- Prisma ORM with SQLite for local development.
- PostgreSQL may be used later for production.
- Google Gemini API for journal summary and sentiment analysis.
- Recharts for mood visualizations.
- Zod for input validation.
- Auth-backed private journal data, preferably through NextAuth or the app's
  chosen auth system.
- lucide-react for icons.

Install missing dependencies only when implementing the feature that needs them.
Keep dependency choices aligned with the documentation unless the installed
Next.js version or current repo setup requires a safer alternative.

## Project Structure

Prefer the existing repository layout. This repo currently uses root-level
`app/`; do not move to `src/app/` unless the task explicitly asks for that
migration.

When adding planned feature areas, use these boundaries:

- `app/` for routes, layouts, loading states, error states, and route handlers.
- `app/(auth)/login` and `app/(auth)/register` for auth screens when auth is
  added.
- `app/dashboard` for the dashboard.
- `app/journal`, `app/journal/new`, `app/journal/[id]`, and
  `app/journal/[id]/edit` for journal flows.
- `app/api/journal`, `app/api/journal/[id]`, `app/api/ai/summarize`, and
  `app/api/dashboard/mood-chart` for API routes when route handlers are needed.
- `components/ui/` for shadcn/ui generated primitives.
- `components/journal/` for editor, mood selector, journal cards, and detail
  views.
- `components/dashboard/` for mood chart, streak counter, and stat cards.
- `components/ai/` for AI summary and sentiment display.
- `components/layout/` for sidebar, header, theme toggle, and navigation.
- `lib/` for Prisma, AI clients, utilities, validators, and shared constants.
- `actions/` for server actions that mutate journal and AI state.
- `hooks/` for client-side journal and mood data hooks when needed.
- `types/` for shared TypeScript types.
- `prisma/` for schema, migrations, and seed files.

## Data Model Rules

Model journal data around authenticated users and journal entries.

Expected `User` fields:

- `id`, optional `name`, unique `email`, `passwordHash`, optional `avatarUrl`,
  `createdAt`, and `updatedAt`.
- A user owns many journal entries.

Expected `JournalEntry` fields:

- `id`, `title`, `content`, `mood`, `moodScore`, optional `tags`.
- AI fields: optional `aiSummary`, `sentimentScore`, `sentimentLabel`, and
  `keywords`.
- `userId` relation with cascade delete.
- `journalDate`, `createdAt`, and `updatedAt`.
- Index by `[userId, journalDate]` and `[userId, mood]`.

Use this mood enum and score mapping consistently:

- `TERRIBLE` = 1
- `BAD` = 2
- `NEUTRAL` = 3
- `GOOD` = 4
- `AMAZING` = 5

Do not hard-code a fake `userId` in production paths. Read the user from the
authenticated session once auth exists.

## API And Server Action Rules

Use Server Actions for mutations when they fit the current Next.js docs. Use
Route Handlers for data fetching endpoints, external integrations, or API
surfaces that need query parameters.

Expected journal API behavior:

- `GET /api/journal` supports pagination, mood filter, date range, and search.
- `POST /api/journal` creates entries with `title`, `content`, `mood`, `tags`,
  and `journalDate`.
- `GET`, `PUT`, and `DELETE /api/journal/[id]` operate on a single entry owned
  by the current user.

Expected dashboard behavior:

- `GET /api/dashboard/mood-chart?days=7` returns daily average mood, entry
  count, and summary stats.
- Support 7 days by default and cap the range at 90 days unless product scope
  changes.
- Preserve missing days with `avgMood: null` and `entries: 0` so charts do not
  misrepresent gaps.

Validate user input with Zod before database writes. Keep validation messages
human and suitable for Indonesian UI copy.

## AI Rules

AI analysis is server-only. Never expose `API_KEY_GEMINI` or journal content
to client-side code beyond the user's own rendered entry and saved analysis.

Use the Gemini API for AI features. Keep the Gemini client and prompt handling
inside server-only modules such as `lib/ai.ts`, route handlers, or server
actions. Prefer structured JSON responses for journal analysis and validate or
sanitize the parsed result before saving it.

The AI output must include:

- `summary`: concise 2-3 sentence summary in the same language as the entry.
- `sentimentScore`: number from `-1.0` to `1.0`.
- `sentimentLabel`: `positive`, `neutral`, or `negative`.
- `keywords`: 3-5 important themes or topics.

Prefer saving the journal entry first, then generating AI analysis. AI failure
should not discard the user's journal entry. Store AI results back on the
entry, revalidate affected journal and dashboard paths, and show a recoverable
state if analysis is pending or failed.

## UX And UI Rules

The product should feel calm, personal, and useful for repeated daily writing.
Use Indonesian copy by default because the product documentation and examples
are in Indonesian.

Required main screens:

- Dashboard: stats cards, 7-day mood chart, writing streak, recent entries, and
  quick add action.
- New entry: mood selector, title, large writing area, optional tags, date
  picker, and submit action.
- Entry detail: title, date, mood badge, rendered content, AI summary,
  sentiment badge, keywords, edit action, and delete action.
- Journal list: search, mood filter, date range filter, entry cards, and
  pagination or infinite scroll.

Mood selection must expose all five mood values clearly and map them to their
scores and colors. Purple can be used as a brand accent, but the UI should not
be dominated by one purple palette; balance it with neutral surfaces and
mood-specific colors.

Use responsive navigation: sidebar on desktop and bottom navigation on mobile
when the app grows beyond a single page. Add dark mode support when theme
infrastructure is implemented.

Prioritize ergonomic writing: comfortable text area, clear save state,
non-destructive AI processing, loading states, empty states, and error states.

## Security And Privacy

Journal entries are private user data. Scope all reads and writes to the
authenticated user. Avoid logging full journal content, AI prompts, secrets, or
private user data.

Keep secrets in environment variables:

- `DATABASE_URL`
- `API_KEY_GEMINI`
- auth secrets such as `NEXTAUTH_SECRET`
- auth base URL such as `NEXTAUTH_URL`

## Implementation Workflow

Before implementing a feature:

1. Check the installed dependencies and existing file layout.
2. Read the relevant local Next.js docs in `node_modules/next/dist/docs/`.
3. Compare the requested work with `daily-journal-mood-tracker-docs.md`.
4. Prefer small vertical slices: schema, server behavior, UI, then verification.

After changes, run the narrowest useful verification:

- `npm run lint` for lint and type-aware framework checks available in the repo.
- `npm run build` before considering larger UI or route changes complete.
- Prisma generate or migration commands when the Prisma schema changes.

Do not treat code snippets in `daily-journal-mood-tracker-docs.md` as
drop-in-compatible with this repo. They are product and architecture guidance;
adapt them to the installed Next.js version, current dependencies, and current
project layout.
