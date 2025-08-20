# Gap Coverage To‑Do Plan (Comprehensive)

Scope: Address all known gaps across security, data/RLS, runtime v2 + external courses, analytics/observability, messaging extraction, files/media, access control, testing, documentation, and ops.

Principles:
- Tests first (TDD): author unit/e2e tests before code edits.
- Small, focused PRs; each with implementation, tests, and docs updates.
- Keep acceptance criteria explicit; add validation checkpoints per item.

---

## P0 — Security & Stability (Blockers)

- [ ] CSRF double‑submit adoption across sensitive routes
  - Description: Enforce cookie `csrf_token` and header `x-csrf-token` on all non‑GET mutations when `CSRF_DOUBLE_SUBMIT=1`.
  - Targets: All `apps/web/src/app/api/**` non‑GET endpoints (messages, assignments, submissions, quizzes, notifications, files, admin, runtime writes where applicable).
  - Implementation:
    - Verify all routes use `createApiHandler` or `withRouteTiming`. Refactor any direct handlers to be wrapped.
    - Ensure `serverFetch` sets `x-csrf-token` for unsafe methods; middleware already issues `csrf_token`.
  - Tests:
    - Unit: missing header → 403; mismatched header/cookie → 403; correct → 2xx.
    - E2E: end‑to‑end mutation with cookie issuance + header forwarding works.
  - Acceptance: All non‑GET routes are protected when flag is on; coverage includes negative cases.

- [ ] Boot‑time env assertions (secrets/env hygiene)
  - Description: Fail fast in production when critical env vars are missing/invalid.
  - Targets: Supabase URL/key; when `RUNTIME_API_V2=1`: `NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`; metrics token if internal metrics exposed.
  - Implementation:
    - Centralize strict validation in shared env module; call from early entry points (middleware + `withRouteTiming` covers some; add SSR/API import path checks).
  - Tests: Unit for env validator; CI job simulating prod env without keys must fail build.
  - Acceptance: Health shows `requiredEnvs` true in prod; boot aborts on missing secrets.

- [ ] Rate limiting coverage expansion
  - Description: Add per‑user and per‑IP limits to sensitive endpoints; standardize headers: `retry-after`, `x-rate-limit-remaining`, `x-rate-limit-reset`.
  - Targets: `api/messages/*`, `api/notifications/*`, `api/runtime/*` writes, `api/files/*`, grading (`submissions` PATCH), any high‑volume routes.
  - Implementation: Use `checkRateLimit` with keys `ip:<ip>` and `user:<userId>:<route>`. Parameterize limits via env.
  - Tests: Unit for allowed/blocked sequencing; E2E expects 429 with correct headers.
  - Acceptance: Documented limits; counters emitted (`rate_limit.hit`).

- [ ] Log redaction / PII audit
  - Description: Ensure sensitive data never appears in logs; expand Pino redact configuration.
  - Targets: `apps/web/src/lib/logger.ts` and any manual logs (services, runtime).
  - Implementation: Add paths for emails/usernames, message bodies, attachment keys, tokens; verify no wholesale request bodies are logged.
  - Tests: Unit snapshot of logger config; integration log sample scan in test‑mode.
  - Acceptance: No PII/secrets in logs; documented in `docs/observability.md`.

- [ ] Security headers parity & documentation
  - Description: Confirm `frame-ancestors` in CSP aligns with `X-Frame-Options: DENY`; `COEP` behind flag behaves as intended.
  - Targets: `apps/web/middleware.ts`, `apps/web/next.config.mjs`.
  - Tests: Unit for expected headers; E2E fetch asserts presence on a sample route.
  - Acceptance: Headers present and consistent; `docs/security.md` updated.

---

## P1 — Runtime v2 & External Courses (ADR 0002)

- [ ] Implement and centralize `isRuntimeV2Enabled()` gate
  - Description: Replace stubs; gate all runtime v2 endpoints by a single helper (`RUNTIME_API_V2===1` and env health).
  - Targets: `apps/web/src/app/api/runtime/**`.
  - Tests: Unit → disabled returns 403; enabled + authorized returns 2xx.
  - Acceptance: Consistent gating across all runtime v2 routes.

- [ ] Shared runtime bearer verification util
  - Description: Centralize RS256 (prod) / HS256 (dev) verification, `aud` origin binding, and `scope[]` enforcement.
  - Targets: All runtime v2 endpoints use the util.
  - Tests: Bad signature → 403; wrong `aud` → 403; missing scope → 403; correct token → 2xx; unit only.
  - Acceptance: No per‑route drift; single source of truth.

- [ ] Per‑endpoint scopes & per‑alias/course/provider rate limits
  - Description: Enforce scopes (`progress.write`, `grade.write`, `events.write`, `checkpoint.read/write`, `files.write`) and granular RL.
  - Tests: Unit matrix for scopes; E2E 429 with headers on abuse.
  - Acceptance: Enforced across all runtime endpoints; counters recorded.

- [ ] Checkpoint persistence + size limits
  - Description: Cap payload (e.g., 32KB); persist to `runtime_checkpoints` with appropriate RLS.
  - Tests: Unit: oversize rejected; E2E: save/load round‑trip.
  - Acceptance: Reliable resume; documented API contract.

- [ ] Idempotency keys for progress/grade
  - Description: Support `Idempotency-Key` header to dedupe retries.
  - Tests: Unit simulate duplicate requests; ensure single write; echo key in response header.
  - Acceptance: Safe provider retries without duplicates.

- [ ] CORS allow + dynamic CSP `frame-src`
  - Description: Honor `RUNTIME_CORS_ALLOW`; extend CSP `frame-src` dynamically based on provider origin.
  - Tests: Unit for header composition; E2E launch path from approved origin works; others blocked.
  - Acceptance: Secure embedding and API access for approved origins.

- [ ] Registry CRUD completeness
  - Description: Implement search, pagination, filters, vendor scoping; versions approve/disable with constraints.
  - Targets: `api/registry/{courses,versions}`; DB constraints and indexes.
  - Tests: Unit + E2E (admin flows), CSV/JSON export.
  - Acceptance: Admin can manage catalog fully; constraints enforced.

- [ ] Assignment linking (`assignment_targets`) + UI picker
  - Description: Persist/validate target on assignment edit; derive CSP allowlist and launch fields.
  - Tests: Unit validation; E2E teacher selects target and student launch succeeds; CSP includes provider.
  - Acceptance: End‑to‑end link → launch flow works.

- [ ] Governance & usage
  - Description: DLQ for runtime writes; usage counters per provider/course/day; vendor/admin UI polish.
  - Tests: Unit DLQ enqueue/retry; E2E admin visibility.
  - Acceptance: Failures observable/retryable; basic usage metrics available.

---

## P1 — Data Model & RLS Tightening

- [ ] Assignments RLS policies (DB‑level)
  - Description: Only teacher owner can insert/update/delete; teachers + enrolled students select.
  - Implementation: Supabase RLS + app checks remain for clarity.
  - Tests: Negative tests for cross‑teacher/student violations.
  - Acceptance: DB denies unauthorized operations.

- [ ] Submissions RLS policies (DB‑level)
  - Description: Students insert/select own; course teacher may grade/select; no post‑grade student edits.
  - Tests: Negative tests for cross‑user access; grade‑after lock enforced.
  - Acceptance: DB enforces lifecycle constraints.

- [ ] Notifications RLS
  - Description: Owner‑only select/update; mark‑read restricted to owner.
  - Tests: Negative tests; E2E mark‑read success for owner only.
  - Acceptance: Strict owner scoping.

- [ ] Interactive tables RLS
  - Description: `interactive_attempts` readable by course teacher and owner; writes by server/service role.
  - Tests: Negative tests; service role writes allowed.
  - Acceptance: Proper visibility without leaks.

- [ ] Index review & performance
  - Description: Verify and add indexes for common paths (courses by teacher, enrollments, attempts, answers, events, checkpoints).
  - Tests: Query plans (explain analyze) in dev; perf smoke.
  - Acceptance: Reasonable latency on list/report endpoints.

---

## P1 — Files & Media

- [ ] AV scanning hook (optional)
  - Description: Pluggable scanning before marking uploads ready.
  - Tests: Unit stub + E2E simulate flagged file → blocked.
  - Acceptance: Scanning path documented; opt‑in via env.

- [ ] Download ownership checks
  - Description: Ensure `download-url` verifies ownership/role (owners/admin; teacher for course material).
  - Tests: Unit + E2E negative (unauthorized cannot fetch signed URL).
  - Acceptance: No unauthorized access to files.

- [ ] Storage quotas enforcement
  - Description: Enforce per‑user quotas; check remaining space pre‑upload; post‑upload accounting.
  - Tests: Unit quotas math; E2E quota exceeded → 413.
  - Acceptance: Predictable quota behavior.

---

## P1 — Analytics & Reporting

- [ ] Event ingestion finalize
  - Description: Standardize `events` schema; emit from key flows (enroll, lesson complete, submission/grade, quiz lifecycle, messaging, notifications).
  - Tests: Unit for transforms; E2E presence in reports.
  - Acceptance: Events power reports reliably.

- [ ] Reports expansion & dashboards
  - Description: Additional teacher/admin reports; SSR pages + CSV export.
  - Tests: E2E render + CSV download; pagination/sorting.
  - Acceptance: Useful analytics coverage beyond current two reports.

- [ ] Metrics backend export
  - Description: Export in‑memory metrics to Prometheus/OpenTelemetry; secure internal endpoint via token; wire `scripts/metrics-alert.js`.
  - Tests: Unit for exposition format; dry‑run alerts.
  - Acceptance: Basic SLO alerting available.

---

## P1 — Messaging Extraction (Service Path)

- [ ] Define `MessagingPort` + OpenAPI from Zod
  - Description: Port interface, codegen schemas, adapters.
  - Tests: Contract tests ensure handler IO matches schemas.
  - Acceptance: Clear boundary for extraction.

- [ ] Standalone service skeleton + proxy flag
  - Description: Spin service; proxy API routes behind feature flag; keep DB co‑located initially.
  - Tests: Integration via proxy; fallback path works.
  - Acceptance: Toggleable extraction path without regressions.

---

## P1 — Access Control & Admin UI

- [ ] Admin role management polish
  - Description: Validate role updates; audit log entries; explicit UI feedback.
  - Tests: E2E role update success/forbidden.
  - Acceptance: Safe, auditable role changes.

- [ ] Course ownership transfer flow
  - Description: Endpoint + UI; enforce permissions and audit.
  - Tests: E2E happy/negative paths.
  - Acceptance: Ownership transfer works and is logged.

---

## P2 — Observability & Ops

- [ ] Background jobs tracing & metrics
  - Description: Propagate `x-request-id` across jobs; emit job timings and error counters.
  - Tests: Unit for propagation; integration log inspection.
  - Acceptance: Jobs observable and traceable.

- [ ] PII redaction review across logs (follow‑up)
  - Description: Broaden redact list; add unit checks for common payloads.
  - Acceptance: Redaction enforced across new log sites.

- [ ] Health & readiness expansion
  - Description: Extend `/api/health` with RLS sanity probe and rate limit config snapshot.
  - Acceptance: Health reflects operational readiness comprehensively.

---

## P2 — Testing & Quality Gates

- [ ] Security tests
  - Description: CSRF origin + double‑submit; rate limits; test‑mode rejection in prod.
  - Acceptance: Negative cases validated in CI.

- [ ] RLS negative tests
  - Description: Unauthorized DB ops fail across critical tables.
  - Acceptance: Denials proven in tests.

- [ ] Contract tests / OpenAPI generation
  - Description: Generate OpenAPI from Zod; validate handler IO matches schema.
  - Acceptance: Contracts enforce compatibility.

- [ ] Load/smoke tests
  - Description: Messaging/events + runtime endpoints; happy and abuse paths.
  - Acceptance: System stable under basic load.

- [ ] Mutation testing thresholds
  - Description: Add thresholds for runtime handlers and registry CRUD; maintain scores.
  - Acceptance: Mutation score gates enforced in CI.

---

## P2 — Documentation & Runbooks

- [ ] Update core docs: `docs/security.md`, `docs/api.md`, `docs/data-model.md`, `docs/observability.md`, `docs/testing.md`
  - Description: Reflect new policies, limits, endpoints, workflows; examples for CSRF, rate limits, runtime tokens.
  - Acceptance: Docs current and actionable.

- [ ] Operational runbooks
  - Description: Rate‑limit tuning, JWKS rotation, runtime key rotation, DLQ replay, metrics SLOs, quotas.
  - Acceptance: On‑call can resolve common issues quickly.

---

### Tracking & Process
- Create one PR per bullet or per very small group.
- Each PR includes: implementation, unit/e2e tests, and docs updates.
- Label PRs by epic: `security`, `runtime`, `registry`, `analytics`, `messaging`, `files`, `rls`, `testing`, `docs`, `ops`.
- Update `docs/TODO.md` checklist as items land; ensure acceptance criteria met per PR.

# Gap Coverage ToDo Plan (Comprehensive)

Scope: Address all known gaps across security, data/RLS, runtime v2 + external courses, analytics/observability, messaging extraction, files/media, access control, testing, docs, and ops. Follow TDD: author tests first, then implement; keep PRs small and focused.

## P0  Security & Stability

- [ ] CSRF doublesubmit adoption across sensitive routes
  - Description: Enforce cookie `csrf_token` and header `x-csrf-token` on all nonGET mutations that change state.
  - Targets: `api/*` mutations (e.g., `messages`, `assignments`, `submissions`, `quizzes`, `notifications`, `runtime/*` where applicable).
  - Implementation:
    - Ensure wrappers already enforce when `CSRF_DOUBLE_SUBMIT=1` (verify `createApiHandler` and `withRouteTiming`).
    - For any handler bypassing wrappers, add checks or refactor to use wrappers consistently.
  - Tests:
    - Unit: send mutation without header  403; mismatched header/cookie  403; matching  200.
    - E2E: flow with cookie issuance from middleware and header forwarding via `serverFetch`.
  - Acceptance: All covered routes reject when token missing/mismatched; green unit+e2e.
  - Owners: backend, tests. Effort: M.

- [ ] Boottime env assertions (secrets/env hygiene)
  - Description: Fail fast in production when critical env vars are missing/invalid.
  - Targets: Supabase URL/key, runtime RS256 keys when `RUNTIME_API_V2=1`, metrics token if internal metrics exposed.
  - Implementation:
    - Centralize in `@education/shared` env module and call from early entry points (`withRouteTiming`, middleware already partially performs checks; extend to API boot path and SSR).
  - Tests: Unit for env validator; CI step that simulates prod env with missing keys  fails.
  - Acceptance: App cannot boot in prod without required envs; health shows requiredEnvs all true.
  - Owners: backend/infra. Effort: M.

- [ ] Rate limiting coverage expansion
  - Description: Add peruser and perIP limits to sensitive endpoints; unify headers: `retry-after`, `x-rate-limit-remaining`, `x-rate-limit-reset`.
  - Targets: `api/messages/*`, `api/notifications/*`, `api/runtime/*` writes, `api/files/*`, grading (`submissions` PATCH), authadjacent endpoints.
  - Implementation: Use `checkRateLimit` with keys: `ip:<ip>`, `user:<userId>:<route>`, and env configs per area.
  - Tests: Unit for allowed/blocked; E2E for 429 with headers.
  - Acceptance: Documented limits; counters emitted (`rate_limit.hit`).
  - Owners: backend, tests. Effort: M.

- [ ] Log redaction/PII audit
  - Description: Ensure PII/secrets not logged; expand pino redact list.
  - Targets: `apps/web/src/lib/logger.ts` and any manual logs.
  - Implementation: Add fields like `email`, `message.body`, `attachments.object_key` if sensitive; verify request bodies are not logged by default.
  - Tests: Unit snapshot of logger config; integration log line scan in test mode.
  - Acceptance: No PII in logs; docs updated in `docs/observability.md`.
  - Owners: backend. Effort: S.

- [ ] Security headers parity & documentation
  - Description: Ensure `frame-ancestors` (via CSP) matches `X-Frame-Options: DENY`; confirm `COEP` behavior behind flag.
  - Targets: `apps/web/middleware.ts`, `apps/web/next.config.mjs`.
  - Tests: Unit for header presence; E2E check via `/api/health` fetch of response headers.
  - Acceptance: Headers present and documented in `docs/security.md`.
  - Owners: backend. Effort: S.

## P1  Runtime v2 & External Courses (ADR 0002)

- [ ] Implement `isRuntimeV2Enabled()` and central gate
  - Description: Replace stubs with shared helper that reads `RUNTIME_API_V2` and environment health.
  - Targets: `api/runtime/*` routes (`context`, `progress`, `grade`, `events`, `event`, `checkpoint/*`, `asset/sign-url`).
  - Tests: Unit to return 403 when disabled; 200 path when enabled and authorized.
  - Acceptance: All runtime v2 endpoints consistently gated.
  - Owners: backend. Effort: S.

- [ ] Shared runtime bearer verification
  - Description: Factor token verification (RS256 in prod, HS in dev) with `aud` origin binding and `scope[]` enforcement into a single utility.
  - Targets: All runtime v2 endpoints.
  - Tests: Unit: bad signature  403; wrong `aud`  403; missing scope  403; good token  200.
  - Acceptance: No perroute drift; central tests.
  - Owners: backend, tests. Effort: M.

- [ ] Perendpoint scopes & rate limits (alias/course/provider)
  - Description: Enforce scopes: `progress.write`, `grade.write`, `events.write`, `checkpoint.read/write`, `files.write`; add peralias/course RL.
  - Tests: Unit + E2E 429 with headers; scope matrix tests.
  - Acceptance: Enforced across endpoints; metrics increment on hits.
  - Owners: backend, tests. Effort: M.

- [ ] Checkpoints persistence & size limits
  - Description: Ensure `save/load` cap payload (e.g., 32KB) and persist via `runtime_checkpoints` with RLS (server writes; alias read).
  - Tests: Unit for size rejection; E2E roundtrip save/load.
  - Acceptance: Reliable resume; documented in API.
  - Owners: backend, tests. Effort: M.

- [ ] Idempotency keys for progress/grade
  - Description: Optional `Idempotency-Key` header to dedupe writes.
  - Tests: Unit simulate duplicate  single effect; headers echoed.
  - Acceptance: Safe retries from providers.
  - Owners: backend. Effort: M.

- [ ] CORS and dynamic CSP framesrc
  - Description: CORS allow per `RUNTIME_CORS_ALLOW`; extend CSP `frame-src` dynamically for provider origins.
  - Tests: Unit for header shapes; E2E launch path works; crossorigin blocked otherwise.
  - Owners: backend. Effort: M.

- [ ] Registry CRUD completeness
  - Description: Search, pagination, filters, vendor scoping; versions approve/disable.
  - Targets: `api/registry/{courses,versions}`; DB constraints.
  - Tests: Unit + E2E (admin UI flows); CSV/JSON export.
  - Owners: backend, frontend, tests. Effort: L.

- [ ] Assignment linking (`assignment_targets`) and UI picker
  - Description: Persist and validate target on create/edit; derive CSP allowlist and launch fields.
  - Tests: Unit for validation; E2E teacher selects target and student launch succeeds.
  - Owners: backend, frontend, tests. Effort: L.

- [ ] Governance & usage
  - Description: Deadletter queue, usage counters, quotas, admin catalog UI polish, vendor portal skeleton.
  - Tests: Unit for DLQ enqueue/retry; E2E admin views.
  - Owners: backend, frontend. Effort: L.

## P1  Data Model & RLS Tightening

- [ ] Assignments DBlevel policies
  - Description: Only teacher owner can insert/update/delete; students/teachers select appropriately.
  - Implementation: Supabase RLS migrations + app checks remain.
  - Tests: RLS negative unit tests (mocked) and e2e checks.
  - Owners: backend (SQL), tests. Effort: M.

- [ ] Submissions DBlevel policies
  - Description: Students insert/select own; teachers of course grade/select.
  - Tests: Negative tests for crossuser access blocked.
  - Owners: backend (SQL), tests. Effort: M.

- [ ] Notifications RLS
  - Description: Owneronly select/update.
  - Owners: backend (SQL), tests. Effort: S.

- [ ] Interactive tables RLS
  - Description: `interactive_attempts` readable by course teacher and user owner; writes by server.
  - Owners: backend (SQL), tests. Effort: M.

- [ ] Index review
  - Description: Ensure query paths have indexes (courses teacher, enrollments, attempts, answers, events, checkpoints).
  - Owners: backend (SQL). Effort: S.

## P1  Files & Media

- [ ] AV scanning hook (optional)
  - Description: Pluggable scanner before marking an upload as ready.
  - Tests: Unit stub; E2E simulate flagging.
  - Owners: backend. Effort: M.

- [ ] Download ownership checks
  - Description: Ensure `download-url` verifies ownership/role before issuing signed URL (owners/admin or teacher for course materials).
  - Tests: Unit + E2E negative.
  - Owners: backend, tests. Effort: S.

- [ ] Storage quotas enforcement
  - Description: Enforce peruser quotas with remaining space checks and postupload accounting.
  - Tests: Unit; E2E quota exceeded  413.
  - Owners: backend. Effort: M.

## P1  Analytics & Reporting

- [ ] Event ingestion finalize
  - Description: Standardize `events` schema; emit from key flows (enroll, complete lesson, submit/grade, quiz events, messaging, notifications).
  - Tests: Unit for transforms; E2E presence in reports.
  - Owners: backend. Effort: M.

- [ ] Reports expansion & dashboards
  - Description: Additional teacher/admin reports; SSR pages with CSV export.
  - Tests: E2E render + CSV.
  - Owners: backend, frontend, tests. Effort: M.

- [ ] Metrics backend export
  - Description: Export inmemory metrics to Prometheus/OpenTelemetry; secure internal endpoint via token; wire alert script.
  - Tests: Unit for metric format; dryrun of `scripts/metrics-alert.js`.
  - Owners: backend, infra. Effort: M.

## P1  Messaging Extraction (Service Path)

- [ ] Define `MessagingPort` and OpenAPI from Zod
  - Description: Port interface, codegen schemas, adapters.
  - Owners: backend. Effort: M.

- [ ] Standalone service skeleton and proxy flag
  - Description: Spin service skeleton; proxy API routes behind feature flag; keep DB colocated initially.
  - Tests: Integration via proxy; fallback path.
  - Owners: backend, infra. Effort: L.

## P1  Access Control & Admin UI

- [ ] Admin role management polish
  - Description: Validate role updates; audit log entries; UI feedback.
  - Tests: E2E.
  - Owners: frontend, backend. Effort: S.

- [ ] Course ownership transfer flow
  - Description: Endpoint + UI; permission checks.
  - Tests: E2E.
  - Owners: backend, frontend. Effort: M.

## P2  Observability & Ops

- [ ] Background jobs tracing & metrics
  - Description: Propagate `x-request-id` across jobs; emit job timings and error counters.
  - Owners: backend. Effort: M.

- [ ] PII redaction review across logs
  - Description: Expand redact list; add unit checks.
  - Owners: backend. Effort: S.

- [ ] Health & readiness
  - Description: Extend `/api/health` to include more checks (RLS sanity probe, rate limit config snapshot).
  - Owners: backend. Effort: S.

## P2  Testing & Quality Gates

- [ ] Security tests
  - Description: CSRF (origin + doublesubmit), rate limits, testmode rejection in prod.
  - Owners: tests. Effort: M.

- [ ] RLS negative tests
  - Description: Unauthorized DB ops fail for all critical tables.
  - Owners: tests. Effort: M.

- [ ] Contract tests/OpenAPI
  - Description: Generate OpenAPI from Zod; validate handler IO matches schema.
  - Owners: backend, tests. Effort: M.

- [ ] Load/smoke tests
  - Description: Messaging/events and runtime endpoints; happy and abuse paths.
  - Owners: tests, infra. Effort: M.

- [ ] Mutation testing thresholds
  - Description: Add thresholds for runtime handlers and registry CRUD; maintainable runtime.
  - Owners: tests. Effort: S.

## P2  Documentation & Runbooks

- [ ] Update `docs/security.md`, `docs/api.md`, `docs/data-model.md`, `docs/observability.md`, `docs/testing.md`
  - Description: Reflect new policies, limits, endpoints, and workflows.
  - Owners: docs. Effort: M.

- [ ] Operational runbooks
  - Description: Ratelimit tuning, JWKS rotation, runtime key rotation, DLQ replay, metrics SLOs.
  - Owners: docs, infra. Effort: M.

---

Tracking & Process
- Create one PR per bullet or small group; include: implementation, tests (unit/e2e), docs update.
- Label PRs with epic tags: security, runtime, registry, analytics, messaging, files, rls, testing, docs, ops.
- Update `docs/TODO.md` checklist as items land; maintain acceptance criteria in PR descriptions.


---

## 100% Closure Plan — Sequenced Sprints (Actionable)

Definition of Done for every PR:
- Tests-first (component/unit/e2e as applicable), then code edits
- Docker: `docker compose build web` passes; `docker compose up -d web` healthy; teardown with `docker compose down`
- Tests executed via tests workspace; save outputs to `reports/` and `artifacts/` (no silent flags)
- Docs updated (`docs/api.md`, `docs/data-model.md`, `docs/security.md`, `docs/observability.md`, `docs/testing.md`, ADRs where relevant)
- Acceptance criteria in PR description with validation checkpoints

### Sprint 0 — Blockers (P0 Security & Stability)
- [ ] CSRF double-submit across all non-GET mutations (unit + e2e negatives/positives)
- [ ] Boot-time env assertions for production secrets/keys (unit + CI simulation)
- [ ] Rate-limit coverage and standard headers on sensitive routes (unit + e2e 429 matrix)
- [ ] Log redaction/PII audit and tests; update observability docs
- [ ] Security headers parity (CSP frame-ancestors, XFO, optional COEP) + docs

Exit: Security suite green; docker compose health OK; smoke e2e passes; reports exported.

### Sprint 1 — Runtime v2 + Registry & Assignment Linking
- [ ] Central `isRuntimeV2Enabled()` gate on all runtime v2 routes
- [ ] Shared runtime bearer verification util (RS256/HS dev, aud binding, scopes)
- [ ] Per-endpoint scopes and granular rate limits (alias/course/provider)
- [ ] Checkpoint persistence with size limits; resume UI indicator
- [ ] Idempotency-Key support for progress/grade
- [ ] CORS allowlist + dynamic CSP frame-src
- [ ] Registry CRUD completeness (search/filters/vendor scoping; versions approve/disable)
- [ ] Assignment linking via `assignment_targets` + Teacher UI picker

Exit: Teacher can link external entry → student launch works with aud/scopes; registry manageable; tests/docs updated.

### Sprint 2 — Data Model/RLS Tightening + Files & Analytics
- [ ] Assignments/Submissions DB-level RLS finalization (negatives covered)
- [ ] Notifications and interactive tables RLS (owner/teacher visibility) + tests
- [ ] Index review for hot paths (courses, enrollments, attempts, answers, events, checkpoints)
- [ ] Files: quotas enforcement, download ownership checks, optional AV scan hook
- [ ] Analytics: finalize event ingestion, expand reports/dashboards, metrics backend export

Exit: DB enforces core permissions; file security/quotas predictable; analytics useful; tests/docs updated.

### Sprint 3 — Messaging Extraction + Access Control & Ops
- [ ] Define `MessagingPort`, generate OpenAPI from Zod, adapters in-place
- [ ] Standalone comms service skeleton; proxy via feature flag; fallback path verified
- [ ] Admin role management polish; course ownership transfer flow (API + UI)
- [ ] Background jobs tracing/metrics; health/readiness expansion; PII redaction follow-up

Exit: Toggleable service path without regressions; admin actions auditable; ops visibility improved.

### Sprint 4 — Governance, Reliability & Distribution (External Courses)
- [ ] DLQ with replay endpoints and background retry jobs
- [ ] Usage counters per day/provider/course; simple admin analytics
- [ ] Vendor portal skeleton; licensing/seats enforcement; version pin/rollback
- [ ] Feature flags and runbooks (rollout, SLOs, rotations, DLQ, quotas)

Exit: Governance and reliability features in place; admin can operate ecosystem safely; all docs/runbooks complete.

