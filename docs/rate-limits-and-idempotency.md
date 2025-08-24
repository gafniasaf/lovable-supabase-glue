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
- Submissions
  - Create: `SUBMISSIONS_CREATE_LIMIT`, `SUBMISSIONS_CREATE_WINDOW_MS`
- Provider health
  - Read: `PROVIDER_HEALTH_LIMIT`, `PROVIDER_HEALTH_WINDOW_MS`
- Registry
  - List: `REGISTRY_LIST_LIMIT`, `REGISTRY_LIST_WINDOW_MS`
  - Mutate: `REGISTRY_MUTATE_LIMIT`, `REGISTRY_MUTATE_WINDOW_MS`
- Reports (read)
  - Activity: `REPORTS_ACTIVITY_LIMIT`, `REPORTS_ACTIVITY_WINDOW_MS`
  - Retention: `REPORTS_RETENTION_LIMIT`, `REPORTS_RETENTION_WINDOW_MS`
- Runtime v2
  - Progress: `RUNTIME_PROGRESS_LIMIT`, `RUNTIME_PROGRESS_WINDOW_MS`
  - Grade: `RUNTIME_GRADE_LIMIT`, `RUNTIME_GRADE_WINDOW_MS`
  - Events: `RUNTIME_EVENTS_LIMIT`, `RUNTIME_EVENTS_WINDOW_MS`
  - Checkpoint save: `RUNTIME_CHECKPOINT_LIMIT`, `RUNTIME_CHECKPOINT_WINDOW_MS`, `RUNTIME_CHECKPOINT_MAX_BYTES`
  - Asset sign-url: `RUNTIME_ASSET_LIMIT`, `RUNTIME_ASSET_WINDOW_MS`
  - Outcomes list/export: `RUNTIME_OUTCOMES_LIMIT`, `RUNTIME_OUTCOMES_WINDOW_MS` (per-teacher per-course)

## 429 response headers
- `retry-after`: seconds until next attempt
- `x-rate-limit-remaining`: remaining tokens in window
- `x-rate-limit-reset`: epoch seconds when window resets

## Idempotency
- Prefer idempotent POST endpoints where practical (e.g., read receipts, notification read-all, upserts).
- Use `onConflict` upserts in Supabase to avoid duplicates.
 - Runtime v2: `Idempotency-Key` supported on `progress` and `grade` (server caches key for TTL and returns `idempotency-replayed: 1` on duplicate)


