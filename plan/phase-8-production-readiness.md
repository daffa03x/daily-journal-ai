# Phase 8: Production Readiness

Status: implemented for local repository readiness.

Implemented scope:

- Added AI rate limiting for all AI analysis entry points.
- Added AI content-size guard before Gemini calls.
- Added user-facing AI error mapping for rate-limit, oversized content, missing
  Gemini key, and generic AI failures.
- Added `Retry-After` response header for rate-limited AI route requests.
- Added `.env.example` and allowed it through `.gitignore`.
- Added `docs/production-readiness.md` with production env, database, AI bounds,
  privacy/logging, smoke test, and rollback notes.
- Reviewed explicit logging usage; no full journal content or prompts are logged
  by app code.

Deferred scope:

- PostgreSQL migration is documented but not applied in this branch to preserve
  the current SQLite local development flow.
- Distributed rate limiting is documented as a follow-up for multi-instance
  production deployment.
- Actual Vercel/hosting deployment is external to this local implementation
  turn.
- `npm audit --audit-level=moderate` currently reports a moderate advisory
  through the Next/PostCSS/Auth.js dependency chain. The automatic force fix is
  not applied because it would install an incompatible old Next version.

Verification target:

- `npm run lint`
- `npm run build`
- `npm audit`
