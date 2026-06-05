# Phase 3 Journal CRUD Vertical Slice

Status: completed.

This note records the Phase 3 implementation from
`plan/daily-journal-mood-tracker-implementation-plan.md`.

## Implemented

- Added journal server actions in `actions/journal.ts`:
  - `createJournalEntry`
  - `updateJournalEntry`
  - `deleteJournalEntry`
- Added journal API route handlers:
  - `GET /api/journal`
  - `POST /api/journal`
  - `GET /api/journal/[id]`
  - `PUT /api/journal/[id]`
  - `DELETE /api/journal/[id]`
- Added journal UI components:
  - `components/journal/mood-selector.tsx`
  - `components/journal/journal-editor.tsx`
  - `components/journal/journal-card.tsx`
  - `components/journal/journal-detail.tsx`
- Implemented journal pages:
  - `app/journal/page.tsx`
  - `app/journal/new/page.tsx`
  - `app/journal/[id]/page.tsx`
  - `app/journal/[id]/edit/page.tsx`
- Added helper utilities in `lib/journal.ts` for:
  - mood score derivation
  - date parsing
  - date input formatting
  - tag normalization/splitting
  - journal list query filters
- Updated dashboard placeholder with links to journal list and new entry flow.

## Behavior

- All journal reads and writes are scoped to the authenticated user's `userId`.
- Create/update/delete server actions call `requireUser()`.
- API routes return `401` for unauthenticated requests and never query without
  `userId`.
- List page supports search, mood filter, date range, and pagination.
- Detail/edit pages use `notFound()` when the entry does not belong to the
  current user.
- Mood score is derived from the shared mood mapping, not user input.

## Deferred

- AI summary generation is intentionally deferred to Phase 4.
- Toasts, delete confirmation dialog, richer markdown rendering, and loading
  polish are deferred to later polish phases.

## Verification

- `npm run lint`
- `npm run build`
- Prisma ownership smoke test: created two users and entries, verified user A
  cannot query user B's entry through user-scoped filters, then cleaned up.

Next phase: Phase 4 Gemini AI summary and sentiment.
