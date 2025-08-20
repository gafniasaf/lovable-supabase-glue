# Environment guardrails

## Test mode
- `TEST_MODE=1` enables synthetic data paths and `x-test-auth` role switching for local/dev.
- Never set `TEST_MODE` in production. Production must ignore/deny `x-test-auth`.

## CSRF
- `CSRF_DOUBLE_SUBMIT=1` enables double-submit protection. Server wrappers enforce cookie/header match.

## Rate limits
- Global per-IP mutation guard: `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS` (ms).
- Endpoint-specific:
  - Messages: `MESSAGES_LIMIT`, `MESSAGES_WINDOW_MS`, `MESSAGES_LIST_LIMIT`, `MESSAGES_LIST_WINDOW_MS`
  - Uploads: `UPLOAD_RATE_LIMIT`, `UPLOAD_RATE_WINDOW_MS`, `UPLOAD_MAX_BYTES`, `ALLOWED_UPLOAD_MIME`
  - Announcements: `ANNOUNCEMENTS_CREATE_LIMIT`, `ANNOUNCEMENTS_WINDOW_MS`, etc. (optional)

## Storage quotas (optional)
- `STORAGE_QUOTA_ENABLED=1` enables quota checks on upload/finalize.

## Observability
- `LOG_LEVEL`, optional pretty logs `PINO_PRETTY=1` (dev only)
- `JWKS_TTL_MS` for runtime JWKS cache


