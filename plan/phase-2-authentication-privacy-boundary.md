# Phase 2 Authentication And Privacy Boundary

Status: completed.

This note records the Phase 2 implementation from
`plan/daily-journal-mood-tracker-implementation-plan.md`.

## Implemented

- Installed Auth.js/NextAuth v5 beta, Prisma adapter, `bcryptjs`, and
  `server-only`.
- Extended Prisma schema with adapter-compatible auth models:
  - `Account`
  - `Session`
  - `VerificationToken`
- Extended `User` with `emailVerified`, `image`, `accounts`, and `sessions`
  while preserving `passwordHash` and `avatarUrl`.
- Added credentials auth configuration in `auth.ts`.
- Added NextAuth route handler at `app/api/auth/[...nextauth]/route.ts`.
- Added server-side auth helpers in `lib/auth.ts`:
  - `getSession`
  - `getCurrentUser`
  - `requireUser`
- Added server actions in `actions/auth.ts`:
  - `registerUser`
  - `loginUser`
  - `logoutUser`
- Added auth validation schemas in `lib/validators.ts`.
- Added login/register pages under `app/(auth)/`.
- Added protected placeholder pages for `/dashboard` and `/journal`.

## Security Notes

- Credentials passwords are hashed with `bcryptjs` before storage.
- Session strategy is JWT because credentials provider works best with JWT
  sessions.
- `auth.ts` now requires a stable `AUTH_SECRET` or `NEXTAUTH_SECRET` instead of
  silently falling back to a development string.
- Auth secrets were removed from `.env.local` so the canonical secret can come
  from `.env` without being shadowed by local placeholders.
- `requireUser()` redirects unauthenticated users to `/login`.
- Dashboard and journal routes perform auth checks at the page/data boundary.
- Future journal actions and API routes must still verify user ownership close
  to the database query.

## Verification

- `DATABASE_URL="file:./dev.db" npx prisma validate`
- `DATABASE_URL="file:./dev.db" npx prisma generate`
- `DATABASE_URL="file:./dev.db" npx prisma db push --skip-generate`
- Prisma auth smoke test: created and deleted a user with a bcrypt password
  hash.
- `npm run lint`
- `npm run build`
- Runtime smoke:
  - `GET /dashboard` while logged out returned `307`
  - `GET /journal` while logged out returned `307`
  - `GET /login` returned `200`

Next phase: Phase 3 journal CRUD vertical slice.
