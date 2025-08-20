### Hardening Sprint Summary

Scope:

- Validation-first: strict Zod on queries and request bodies; response DTO parsing before returning.
- Config & envs: unified server-only env validation in `@education/shared`.
- Access control & rate limits: submissions visibility/grade ACLs; files signer scoping; per-user rate limits.

Key changes:

- DTOs: `packages/shared/src/dto/*` for assignments, submissions, quizzes, messages, notifications, dashboard, runtime attempts. Routes call `dto.parse(...)` before responding; failures return 500 `{ error, requestId }`.
- Request IDs: all responses set `x-request-id`; errors include `requestId`.
- Strict queries/bodies: most `GET` routes now use `.strict()` query schemas; `POST/PATCH` schemas are `.strict()` across shared requests.
- Env: `loadServerEnv()` in shared validates Supabase public envs, RS256 keys (required in prod with `RUNTIME_API_V2=1`), numeric rate limits, and `RUNTIME_CORS_ALLOW`. Web reuses this loader.
- ACLs:
  - Submissions list: students see only their own; teachers must own the course to view others.
  - Grade submission: only the course-owning teacher can grade.
  - Files: presigned upload restricted to owner/course; MIME allowlist and size caps (test-mode path), upload rate limits.
- Rate limits (env-configurable): submissions create, grading, messaging send, uploads; runtime events keep rate limit per alias+course.

Error codes:

- Normalized to: `BAD_REQUEST`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `DB_ERROR`, `TOO_MANY_REQUESTS`, `INTERNAL`, `NOT_IMPLEMENTED`.

SDK wrapper:

- `apps/web/src/lib/sdk.ts` — `fetchJson(schema, url, opts?)` enforces response schemas at the boundary.

Paging:

- `x-total-count` verified on assignments, submissions, quizzes, runtime outcomes.

Testing guidance (for Coder C):

- 400: invalid/extra query keys, invalid body keys (strict schemas); malformed IDs.
- 500: DTO parsing failure (server returns 500 with `requestId`).
- 401: unauthenticated requests.
- 403: forbidden — teacher ownership checks (submissions list/grade, files upload/download), role restrictions (teacher-only/admin-only), runtime scope/aud mismatches.
- 404: not found (e.g., quiz attempt not found on submit, file not found, message/thread not found).
- 429: rate limits exceeded — submissions create, grading, messaging send, uploads, runtime events (alias+course).

Matrix (examples):

- Assignments GET: 400 bad `course_id`; 401 no auth; 200 returns array + `x-total-count`; 500 if row breaks DTO.
- Submissions GET: 400 bad query; 401; 403 teacher without ownership; 200 student sees only own; 500 DTO failure.
- Submissions PATCH (grade): 401; 403 non-teacher; 403 teacher not owner; 200 updates; 429 when `GRADING_LIMIT` hit.
- Messages POST: 401; 429 when `MESSAGES_LIMIT` hit; 201 creates; 500 DTO failure in dev stub path.
- Files upload-url POST: 401; 400 unsupported MIME; 403 owner mismatch; 200 returns signed URL; 429 on `UPLOAD_RATE_LIMIT`.
- Providers POST: 401; 403 non-admin; 400 invalid jwks_url/domain; 201 returns provider DTO.
- Registry courses GET: 401; 403 when disabled; 200 returns DTO array + `x-total-count`; 500 DTO failure.
- Runtime v2 progress/grade/events: 401 missing token; 403 invalid token / missing scope / audience mismatch; 429 on rate limits; 201 ok; CORS headers when origin allowed.

