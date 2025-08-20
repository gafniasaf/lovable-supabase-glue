Runtime Tokens: Scopes and Audience (Quick Ref)

Claims (minimum)
- aud: must equal request Origin when Origin is in RUNTIME_CORS_ALLOW
- courseId: target course id
- alias: pseudonymous user alias for rate-limits
- scopes: array of strings
- iat/exp: standard times

Common scopes
- progress.write: POST /api/runtime/progress, checkpoint/save
- progress.read: GET /api/runtime/checkpoint/load
- attempts.write: POST /api/runtime/grade, outcomes (fallback path)
- files.write: POST /api/runtime/asset/sign-url
- events.write: POST /api/runtime/events (type-specific enforcement)

Audience binding
- When request includes an Origin and Origin is allowed by env, aud must match that Origin exactly.

Idempotency
- Provide Idempotency-Key on progress/grade to avoid duplicate writes.



