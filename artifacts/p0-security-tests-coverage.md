P0 Security & Stability: Test Coverage Snapshot

Scope: backend-only tests (no FE gateway overlap). Tests are authored; execution intentionally deferred.

CSRF
- Origin/Referer + double-submit enforced via wrappers
  - server.withRouteTiming: `server.withRouteTiming.csrf.spec.ts`, `server.withRouteTiming.csrf-double-submit.spec.ts`
  - apiHandler: `apiHandler.csrf.spec.ts` (also skips CSRF for `/api/runtime/*`)
- Middleware cookie issuance: `middleware.csrf-cookie.spec.ts`
- Route examples: `api.messages.csrf-double-submit.spec.ts`, `api.assignments.post.csrf.spec.ts`, `api.notifications.patch.csrf.spec.ts`, `api.notifications.read-all.csrf.spec.ts`

Runtime v2 Auth, CORS, Idempotency
- Auth exchange: `api.runtime.auth.exchange.spec.ts`, `.edgecases.spec.ts`
- Verify: `lib.runtimeAuth.spec.ts`
- CORS headers/preflight: `api.runtime.cors.headers.spec.ts`, `lib.cors.preflight.spec.ts`, `api.runtime.grade.cors.preflight.spec.ts`
- Idempotency: `api.runtime.idempotency.spec.ts`, `api.runtime.grade.idempotency.spec.ts`, `lib.idempotency.ttl.spec.ts`
- Outcomes (JWKS + runtime token): `api.runtime.outcomes.jwks.spec.ts`, `api.runtime.outcomes.runtime-token.spec.ts`

Security Headers
- Middleware: `middleware.security-headers.spec.ts`, `.more.spec.ts`, `middleware.headers-and-guards.spec.ts` (includes prod RS256 guard)
- CSP builder: `lib.csp.headers.spec.ts`, `lib.csp.frame-src-allow.spec.ts`

Rate-Limiting (429 headers contract)
- Runtime: `api.runtime.rate-limit.spec.ts` (progress), `api.runtime.grade.ratelimit.spec.ts`, `api.runtime.events.ratelimit.spec.ts`, `api.runtime.outcomes.rate-limit.spec.ts`, `api.runtime.asset.sign-url.ratelimit.spec.ts`
- Files: `api.files.upload-url.ratelimit.spec.ts`
- Messages: `api.messages.post.ratelimit.spec.ts`, `api.messages.list.ratelimit.spec.ts`, `api.messages.threads.ratelimit.spec.ts`
- Notifications: `api.notifications.rate-limit.spec.ts`, `api.notifications-preferences.rate-limit.spec.ts`
- Providers: `api.providers.health.ratelimit.spec.ts`, `api.providers.ratelimit.spec.ts`
- Registry (external courses): `api.registry.versions.rate-limit.spec.ts`, `api.registry.mutations.ratelimit.spec.ts`, `api.registry.courses.rate-limit.spec.ts`
- Assignments/Modules/Quizzes: `api.assignments.delete.ratelimit.spec.ts`, `api.modules.delete.ratelimit.spec.ts`, `api.quizzes.ratelimit.spec.ts`
- Courses transfer: `api.courses.transfer-owner.ratelimit.spec.ts`
- Admin: `api.admin.quotas.ratelimit.spec.ts`

Files & Media
- Ownership/guards/quota/MIME: `api.files.download-url.permissions.spec.ts`, `.dev-namespace.guard.spec.ts`, `.content-type-default.spec.ts`, `.upload-url.content-type.spec.ts`, `.upload-url.quota.spec.ts`, `.quota.enforcement.spec.ts`, `api.files.finalize.permissions.spec.ts`
- Runtime asset signing scopes/MIME: `api.runtime.asset.sign-url.scope.spec.ts`

Logging (PII)
- Redaction lists: `lib.logger.redaction.spec.ts`, `lib.logger.redaction.extended.spec.ts`

Server Fetch
- Base URL, header propagation, and CSRF attachment rules: `lib.serverFetch.baseurl.spec.ts`, `lib.serverFetch.headers.spec.ts`, `lib.serverFetch.csrf-header.spec.ts` (unsafe only)

Observability & Metrics
- withRouteTiming: `server.withRouteTiming.metrics.spec.ts`, `lib.metrics.inflight.spec.ts`

Notes
- Runtime RS256 key presence is validated in production via middleware; covered in `middleware.headers-and-guards.spec.ts`.
- All new tests validate 429 response headers where rate limits apply: `retry-after`, `x-rate-limit-remaining`, `x-rate-limit-reset`.



