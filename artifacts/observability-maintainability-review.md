## Observability and Maintainability Review

Scope: apps/web (Next.js), packages/shared, tests, Docker configs. Focused on logging, error handling, configuration, security headers, metrics, rate limiting, and consistency.

### What’s solid today
- Request tracing: Global `x-request-id` propagation via middleware and echoed by most routes; per-request logger (`getRequestLogger`) with branch/commit bindings.
- Structured logging: Pino wrapper with pretty transport toggle and robust PII redaction list (`apps/web/src/lib/logger.ts`).
- Response DTO enforcement: `jsonDto` validates and standardizes responses, includes `requestId` on error/success.
- Consistent wrappers: `withRouteTiming` adds timings, error logs, headers; `createApiHandler` provides body validation, CSRF, rate limit, error normalization.
- Config validation: Zod schemas for client/server envs with fail-fast checks (`packages/shared/src/env.ts`).
- Metrics: In-memory p50/p95/p99, error counts, in-flight, exposed via `/api/admin/metrics` (JSON and Prometheus-like text).
- Runtime hardening: CSP, HSTS, frame policies in middleware; test-mode guards.

### Gaps and risks
- CSRF/rate-limit duplication: Both `withRouteTiming` and `createApiHandler` implement CSRF and optional global IP rate limiting. Endpoints wrapped as `withRouteTiming(createApiHandler(...))` apply checks twice, increasing drift risk.
- CSP logic duplication: Middleware computes CSP inline while `lib/csp.ts` exposes `buildDefaultCsp`. Divergence risk between the two implementations.
- Inconsistent wrapper usage: `/api/ready` does not use `withRouteTiming` or `jsonDto` and may skip echoing `x-request-id` from route-level (middleware likely adds, but route-level echo is safer). `/api/health` skips `withRouteTiming` (uses `jsonDto`).
- Mixed logging surfaces: `serverFetch` logs via `console.debug` instead of the Pino facade on server; analytics uses `console.debug` in non-test. Harder to correlate in prod.
- Redis fallback: `lib/redis.ts` attempts `ioredis` only; docstring mentions Upstash REST but no fetch-based fallback implemented. When Redis is absent, async limiters/idempotency silently fall back to in-memory only.
- DTO sprawl: Many DTOs defined inline within route files; reuse across routes is limited, increasing maintenance cost.
- Logger typing: Logger facade exported as `any`; weak typing reduces IDE assistance and misuse detection.
- Coverage gaps (tests): No explicit tests asserting log redaction, request-id echo on all endpoints, or metrics counters/timings behavior.

### Recommendations (prioritized)
1) Deduplicate security logic (High)
   - Remove CSRF and global IP rate-limit checks from `withRouteTiming` or guard them off when the handler is produced by `createApiHandler`. Keep `withRouteTiming` focused on timing/headers/logging; centralize CSRF/rate-limit inside `createApiHandler` only.
   - Rationale: Single source of truth, fewer drift vectors; simpler mental model.

2) Centralize CSP construction (High)
   - Reuse `buildDefaultCsp(nonce)` from `lib/csp.ts` inside middleware. Extend it (frame-src allowlist, COEP toggle) behind options to avoid duplicating string surgery.

3) Standardize wrappers on all routes (Medium)
   - Wrap `/api/ready` in `withRouteTiming` and return via `jsonDto` to ensure uniform headers and metrics. Consider wrapping `/api/health` similarly for consistent timing logs (it already uses `jsonDto`).

4) Unify server logging (Medium)
   - In `serverFetch`, switch server-side `console.debug` to the Pino logger facade with `requestId` binding; keep browser path as-is. Add a rate-limited sampler if noise is a concern.
   - Optionally route analytics `console.debug` through the logger when `NODE_ENV !== 'test'` and running server-side.

5) Implement Redis REST fallback (Medium)
   - If `ioredis` is unavailable and `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set, implement simple fetch-based `SET NX EX` and `INCR + EXPIRE` helpers so async rate limiting/idempotency operate cross-instance.

6) Consolidate common DTOs (Medium)
   - Extract shared Zod schemas for entities and list responses into `packages/shared` and import into routes. Reduces schema drift and duplicate maintenance.

7) Strengthen types and docs (Low)
   - Export a typed `Logger` interface from the facade instead of `any`. Add short JSDoc on wrapper helpers (`withRouteTiming`, `createApiHandler`) describing responsibilities to prevent future duplication.

8) Operational ergonomics (Low)
   - Docker compose: expose `LOG_LEVEL` and `PINO_PRETTY` envs with sane local defaults. Add a note in README on setting `PINO_PRETTY=1` locally.

### Concrete code touchpoints
- CSRF/rate-limit duplication: `apps/web/src/server/withRouteTiming.ts`, `apps/web/src/server/apiHandler.ts`.
- CSP centralization: `apps/web/middleware.ts`, `apps/web/src/lib/csp.ts`.
- Health/ready consistency: `apps/web/src/app/api/ready/route.ts`, `apps/web/src/app/api/health/route.ts`.
- Logger usage in fetch: `apps/web/src/lib/serverFetch.ts`.
- Redis fallback: `apps/web/src/lib/redis.ts`, `apps/web/src/lib/rateLimit.ts`, `apps/web/src/lib/idempotency.ts`.
- DTO consolidation: Many route files under `apps/web/src/app/api/**` and `packages/shared`.

### Tests to add before refactors (TDD)
- Log redaction: verify sensitive fields are redacted in `logger` output.
- Request-id propagation: every API response contains `x-request-id` and body `requestId` via `jsonDto` where applicable.
- Metrics: routes increment `in_flight`, record timings/errors correctly; `/api/admin/metrics` matches expected shape.
- CSP: middleware-generated CSP equals `buildDefaultCsp` baseline for a given nonce and allowlists.
- CSRF/rate-limit: ensure single enforcement (no double blocking) after deduplication.
- Redis fallback: simulated absence of `ioredis` but presence of Upstash REST env performs expected limiting/idempotency.

### Suggested migration steps (safe, incremental)
1) Add tests above (no prod behavior change).
2) Refactor `withRouteTiming` to remove/guard CSRF/rate-limit; leave timing/logging/headers only.
3) Switch middleware CSP building to `buildDefaultCsp` + small extension hooks.
4) Wrap `/api/ready` with `withRouteTiming` and return via `jsonDto`.
5) Update `serverFetch` to use logger on server runtime.
6) Add Redis REST fallback behind env flags.
7) Move common DTOs to `packages/shared` progressively.

All changes should follow the repo’s TDD flow (component tests first, build+run in Docker, then unit and E2E), and produce reports under `reports/` with artifacts in `artifacts/`.


