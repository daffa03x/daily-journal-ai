# Phase 6: Layout, Navigation, And Theming

Status: implemented.

Implemented scope:

- Added `next-themes` and wired a root theme provider.
- Added route-aware app shell for protected app routes:
  - `components/layout/app-shell.tsx`
  - `components/layout/sidebar.tsx`
  - `components/layout/header.tsx`
  - `components/layout/mobile-bottom-nav.tsx`
  - `components/layout/theme-toggle.tsx`
  - `components/layout/theme-provider.tsx`
- Added desktop sidebar navigation for dashboard, journal, and new entry.
- Added mobile bottom navigation for the same primary routes.
- Added sticky header with quick add, theme toggle, and logout.
- Enabled class-based dark mode with persisted system/light/dark behavior.
- Reduced page-level viewport styling on dashboard and journal routes so the
  shared shell controls the application frame.

Verification:

- `npm run lint`
- `npm run build`

Notes:

- Auth and public routes remain outside the app shell.
- Each protected page still enforces auth server-side; the shell is navigation
  and presentation, not an authorization boundary.
