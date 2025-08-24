# Security Hardening

## CSRF Protection
- All non-GET/HEAD routes are wrapped with `withRouteTiming` or `createApiHandler`, which enforce:
  - Origin/Referer same-origin checks (skipped for `/api/runtime/**` which are designed for cross-origin providers)
  - Optional double-submit token when `CSRF_DOUBLE_SUBMIT=1`: header `x-csrf-token` must match cookie `csrf_token` (cookie is issued by middleware)
- Client/server fetch helpers attach the CSRF header automatically for unsafe methods when the cookie is present.

## Rate Limiting
- Global per-IP mutation limit is available via `GLOBAL_MUTATION_RATE_LIMIT` and `GLOBAL_MUTATION_RATE_WINDOW_MS` and enforced by the wrapper. 429 responses include:
  - `retry-after`, `x-rate-limit-remaining`, `x-rate-limit-reset`, `x-request-id`
- Per-feature limits are applied on sensitive endpoints (e.g., messages, uploads, provider health, runtime v2, reports). Headers mirror the global shape.
- Reports (read): `REPORTS_ACTIVITY_LIMIT`/`REPORTS_ACTIVITY_WINDOW_MS`, `REPORTS_RETENTION_LIMIT`/`REPORTS_RETENTION_WINDOW_MS`.

## Security Headers
- Middleware sets:
  - Content-Security-Policy (CSP) with per-request nonce and dynamic `frame-src` extension based on `RUNTIME_FRAME_SRC_ALLOW` and `RUNTIME_CORS_ALLOW`
  - Strict-Transport-Security (prod only)
  - Referrer-Policy: `strict-origin-when-cross-origin`
  - X-Content-Type-Options: `nosniff`
  - X-Frame-Options: `DENY`
  - Permissions-Policy: geolocation=(), microphone=(), camera=()
  - Cross-Origin-Opener-Policy: `same-origin`
  - Cross-Origin-Resource-Policy: `same-origin`
  - Optional Cross-Origin-Embedder-Policy: `require-corp` when `COEP=1`

## Runtime v2
- Gate: `isRuntimeV2Enabled()` guards all runtime v2 endpoints.
- Auth: RS256 (prod) / HS256 (dev/test) via `verifyRuntimeAuthorization`, audience binding to allowed origin, scopes per endpoint.
- CORS: `RUNTIME_CORS_ALLOW` adds `access-control-allow-origin`; `OPTIONS` preflights return 204 with `vary: Origin`.
- Idempotency: `Idempotency-Key` supported on `progress` and `grade` (replay returns `idempotency-replayed: 1`).

## Production Env Assertions
- Middleware fails fast in production when:
  - `x-test-auth` is present
  - `TEST_MODE=1` without explicit E2E allowance
  - `RUNTIME_API_V2=1` but RS256 keys (`NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`) are missing
  - `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing or URL not https

## Logging
- Pino is configured with redaction of PII/secrets: headers auth/cookies, `x-test-auth`, user identifiers, message body, attachment object keys, runtime keys, and Supabase anon key. See `apps/web/src/lib/logger.ts` for the paths.


