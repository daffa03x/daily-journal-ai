# Production Readiness

This app is ready for a small production pilot after environment variables,
database hosting, and deployment settings are configured.

## Required Environment Variables

Server-only variables:

- `DATABASE_URL`: database connection string.
- `API_KEY_GEMINI`: Google Gemini API key.
- `AUTH_SECRET`: Auth.js secret. Use one stable value per environment.
- `NEXTAUTH_SECRET`: fallback auth secret for compatibility with current setup.
- `NEXTAUTH_URL`: canonical app URL, for example `https://your-app.vercel.app`.

Do not prefix secrets with `NEXT_PUBLIC_`. Next.js bundles `NEXT_PUBLIC_*`
variables into client JavaScript.

## Database

Local development currently uses SQLite:

```env
DATABASE_URL="file:./dev.db"
```

For production, use a hosted PostgreSQL database such as Neon or Supabase.
Before switching production traffic:

1. Create the hosted PostgreSQL database.
2. Set production `DATABASE_URL` to the hosted connection string.
3. Update `prisma/schema.prisma` datasource provider from `sqlite` to
   `postgresql` in the production migration branch.
4. Run Prisma migration/generation in CI or deployment setup.
5. Smoke test register, login, create entry, AI analysis, dashboard, edit, and
   delete.

Keep SQLite for local development until the production database migration is
ready to be tested as its own deployment task.

## AI Usage Bounds

AI analysis is server-only and uses `API_KEY_GEMINI` only in server modules.

Current production safety bounds:

- AI analysis rate limit: 10 requests per authenticated user per hour.
- AI content size guard: 6000 characters per entry analysis.
- AI failure never blocks journal entry creation.
- Invalid Gemini payloads are not saved.

The current rate limiter is in-memory and suitable for a single instance or a
small pilot. For multi-region or high-scale deployment, replace it with Redis,
Upstash, or a database-backed limiter.

## Logging And Privacy

Do not log:

- Full journal content.
- AI prompts.
- AI API keys.
- Auth secrets.
- Raw session tokens.

Current code avoids explicit `console.log` calls for private content. Keep this
rule when adding observability.

## Deployment Checklist

- Set all production environment variables.
- Confirm `.env` and `.env.local` are not committed.
- Configure the production database.
- Run `npm run lint`.
- Run `npm run build`.
- Run `npx prisma generate`.
- Run `npm audit --audit-level=moderate`.
- Run migrations or `prisma db push` only according to the selected deployment
  strategy.
- Smoke test:
  - register
  - login
  - create journal entry
  - generate/retry AI summary
  - view dashboard chart/stats
  - edit entry
  - delete entry

## Rollback Notes

If AI usage causes failures or cost spikes, remove `API_KEY_GEMINI` from the
deployment environment or lower the rate limit. Journal CRUD continues working
without AI analysis.

## Known Audit Note

At the time of this Phase 8 pass, `npm audit --audit-level=moderate` reports a
moderate advisory through `next`/`postcss`/`next-auth`. The suggested automatic
fix requires `npm audit fix --force` and would install an incompatible old Next
version, so it should not be applied blindly. Re-run audit before deployment and
upgrade when a compatible Next/Auth.js release is available.
