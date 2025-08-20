# Rate limits and idempotency

## Wrappers
- All non-GET/HEAD routes are wrapped with `withRouteTiming` or `createApiHandler`, which can enforce:
  - Same-origin CSRF checks
  - Optional CSRF double-submit (`CSRF_DOUBLE_SUBMIT=1`)
  - Global per-IP mutation guard: `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS`

## Endpoint-specific limits
- Messages
  - Read: `MESSAGES_LIST_LIMIT`, `MESSAGES_LIST_WINDOW_MS`
  - Write: `MESSAGES_LIMIT`, `MESSAGES_WINDOW_MS`
- Uploads
  - `UPLOAD_RATE_LIMIT`, `UPLOAD_RATE_WINDOW_MS`, `UPLOAD_MAX_BYTES`, `ALLOWED_UPLOAD_MIME`
- Announcements (optional)
  - `ANNOUNCEMENTS_CREATE_LIMIT`, `ANNOUNCEMENTS_WINDOW_MS`

## 429 response headers
- `retry-after`: seconds until next attempt
- `x-rate-limit-remaining`: remaining tokens in window
- `x-rate-limit-reset`: epoch seconds when window resets

## Idempotency
- Prefer idempotent POST endpoints where practical (e.g., read receipts, notification read-all, upserts).
- Use `onConflict` upserts in Supabase to avoid duplicates.


