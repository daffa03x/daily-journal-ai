# Phase 0 Tooling Alignment

Status: completed.

This note records the Phase 0 implementation decisions from
`plan/daily-journal-mood-tracker-implementation-plan.md`.

## Verified Local Next.js Docs

Read these installed Next.js 16 docs before changing app structure:

- `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`

Key implementation notes:

- Root-level `app/` is valid. Do not migrate to `src/app/` unless requested.
- Pages and layouts are Server Components by default.
- Add `"use client"` only to interactive components that need state, effects,
  browser APIs, or event handlers.
- Server Functions and Server Actions are reachable by direct POST requests, so
  every mutation must verify authentication and ownership.
- Route Handlers belong inside `app/**/route.ts` and cannot live beside a
  `page.tsx` at the same route segment.
- Secrets such as `API_KEY_GEMINI` must stay in server-only modules and must not
  be imported into Client Component graphs.

## Tailwind CSS 4

The project is using Tailwind CSS 4:

- `app/globals.css` imports Tailwind with `@import "tailwindcss";`
- `postcss.config.mjs` uses `@tailwindcss/postcss`

shadcn/ui initialization validated Tailwind v4 successfully.

## shadcn/ui Decision

shadcn/ui is initialized for this repo using:

```bash
npx shadcn@latest init --defaults --template next --no-monorepo --no-reinstall
```

Generated or updated files:

- `components.json`
- `components/ui/button.tsx`
- `lib/utils.ts`
- `app/globals.css`

The generated config uses:

- root-level `app/globals.css`
- import aliases from `tsconfig.json`
- `components/ui` for UI primitives
- `lib/utils.ts` for `cn()`
- lucide icon library

## Phase 0 Completion Criteria

- Local Next.js docs were read and summarized.
- Tailwind CSS 4 setup was confirmed.
- shadcn/ui was initialized against the current Next.js and Tailwind setup.
- Baseline `lib/utils.ts` exists.
- App metadata now reflects the Daily Journal product.

Next phase: Phase 1 data foundation.
