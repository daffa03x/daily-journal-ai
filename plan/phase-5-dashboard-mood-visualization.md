# Phase 5: Dashboard And Mood Visualization

Status: implemented.

Implemented scope:

- Added shared dashboard data helper in `lib/dashboard.ts`.
- Added `GET /api/dashboard/mood-chart?days=7` with auth scoping and max
  90-day cap.
- Added dashboard components:
  - `components/dashboard/mood-chart.tsx`
  - `components/dashboard/streak-counter.tsx`
  - `components/dashboard/stats-cards.tsx`
  - `components/dashboard/recent-entries.tsx`
- Replaced the placeholder dashboard with stats, mood trend chart, writing
  streak, range controls for 7/14/30 days, recent entries, and quick add links.
- Added `app/dashboard/loading.tsx` skeleton state.
- Installed `recharts` for the mood chart.

Behavior notes:

- Missing chart days are preserved with `avgMood: null` and `entries: 0`.
- Streak is calculated from consecutive `journalDate` values, not creation time.
- Dashboard and API data are scoped to the authenticated user.

Verification:

- `npm run lint`
- `npm run build`
