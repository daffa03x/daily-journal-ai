# Phase 7: Polish And Enhancements

Status: implemented.

Implemented scope:

- Added app-level toast notifications:
  - journal create/update/delete through redirect query state
  - AI success/error through client toast events
- Added journal list loading skeleton in `app/journal/loading.tsx`.
- Added delete confirmation for entry detail through
  `components/journal/delete-entry-form.tsx`.
- Added lightweight markdown rendering for journal detail content:
  headings, paragraphs, emphasis, strong text, and simple lists.
- Added tag filtering to journal list and `GET /api/journal`.
- Added tag quick-filter chips from the user's existing journal tags.
- Added Markdown export for entry detail.
- Added subtle route transitions with Framer Motion in the app shell.

Deferred scope:

- PDF export remains deferred.
- Calendar view remains deferred.
- PWA support remains deferred.

Verification:

- `npm run lint`
- `npm run build`
