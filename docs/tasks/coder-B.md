### Coder B — Backend/API/DB Checklist

Highest Priority: Hardening Sprint (3–5 days)

Day 6 — Validation First
- Add Zod to every API route.
- Wrap all GETs with strict query schemas (course_id, pagination, filters).
- Add `.strict()` to POST/PATCH schemas to reject unknown keys.
- Introduce response DTOs under `packages/shared/src/dto/*` and parse before returning.
- Coordinate with Coder C for negative tests (400 on bad query/extra key; 500 on invalid DB value with requestId).

Day 7 — Config & Environments
- Unify env validation in `packages/shared/src/env.ts`; fail-fast if missing/invalid; rotation-ready keys.
- Abstract Supabase keys into env; server-only schema validates at bootstrap.

Day 8 — Access Control & Security
- Enforce negatives: student cannot read others’ submissions; teacher cannot grade another teacher’s course; file signed URLs scoped to owner/course.
- Add rate-limit middleware/guards on login, submissions create, grading, messaging.

Day 9 — Testing & Coverage (with Coder C)
- Mutation testing (Stryker) on `services/{submissions,progress,assignments}` (≥90% score in CI gate).
- UI critical flows (owned by A/C) ensure contracts are honored.

Day 10 — Developer Experience
- Build `apps/web/src/lib/sdk.ts` with `fetchJson(schema, url, opts)` to validate responses at the boundary.
- Optional: Storybook setup by A; provide DTOs for stories.

Deliverables
- ≥90% coverage on API routes (positive + negative by Coder C).
- Unified env validation with fail-fast.
- Response DTOs validated before sending to client.
- SDK wrapper enforcing schemas at the network boundary.
- Mutation testing active with thresholds.

Notes
- Do not edit `apps/web/src/lib/data/**` (Coder A’s gateways). Continue owning `apps/web/src/app/api/**`, `apps/web/src/server/**`, `supabase/migrations/**`, and `packages/shared/src/schemas/**`.

---

Do (owned areas)
- `apps/web/src/app/api/**` (route handlers)
- `apps/web/src/server/**` (services, helpers)
- `packages/shared/src/schemas/**` (Zod contracts)
- `supabase/migrations/**` (DDL/RLS)

Don’t Touch
- `apps/web/src/lib/data/**`, UI components/layout in `apps/web/src/app/**`

Setup
1) Run dev with real envs if available: `npm --workspace apps/web run dev`
2) Keep contracts in sync with UI via `packages/shared/src/schemas/**`.

Tasks (execute in order)
1) Contract hardening
   - Stabilize and document schemas for courses, lessons, enrollments, assignments, submissions, quizzes, messages, announcements, notifications, files, reports.
   - Update `docs/api.md` examples per endpoint.

2) Route handlers
   - Ensure each route uses `createApiHandler` with schema validation and consistent error envelope.
   - Add rate limits and CSRF headers where flagged in `docs/architecture.md`.

3) Services & RLS
   - Implement domain logic in `src/server/services/**`.
   - Tighten RLS policies in migrations; add helpful indexes.

4) Unit tests (coord with QA)
   - Write service-level Jest tests in `tests` workspace (C will guide structure).

Exit criteria
- Routes validate inputs and return schema-compliant responses; migrations apply cleanly; service unit tests pass; e2e still green in TEST_MODE.



### Current backend to-do plan (independent track)

Scope/ownership
- Only touch: `apps/web/src/app/api/**`, `apps/web/src/server/**`, `supabase/migrations/**`, `packages/shared/src/{schemas,dto}/**`, `docs/**`, `scripts/**`.
- Do not touch: `apps/web/src/lib/data/**`, `apps/web/src/app/**` (non-API UI).

Contracts and DTOs (packages/shared)
- Add versioned DTOs for additive response changes (e.g., `dashboardResponseV2`); keep legacy types until FE cuts over.
- Ensure DTOs cover all list endpoints that return pagination headers; add missing ones for modules/enrollments if any.
- Document Problem envelope and validation status in `docs/api.md` (ensure examples are consistent).

API surface consistency (apps/web/src/app/api)
- Pagination: Standardize `offset`, `limit`, and `x-total-count` on all list endpoints; verify modules/enrollments/messages.
- CSRF: Ensure non-GET routes go through `withRouteTiming` (origin checks) and optional double-submit token when `CSRF_DOUBLE_SUBMIT=1`.
- Rate limits: Add per-user limits to parent-links CRUD and providers health; verify global non-GET IP limits are configurable.
- Error envelopes: Audit for uniform Problem envelope + `x-request-id` echo; fix inconsistencies.

Services and domain logic (apps/web/src/server/services)
- Dashboard: Implement real `studentsEnrolled` (distinct students across teacher’s courses) and guard pass-rate math.
- Progress: Add `getCourseProgress(userId, courseId)` fast-path summarizer to reduce repeated joins.
- Notifications: Emit minimal producers for grade posted, message received, announcement created (idempotent writes).
- Messaging: Use read-receipts table/index; expose idempotent `markRead` with scope checks.
- Reports: Materialize DB-side aggregates for engagement and grade distribution; ensure CSV/JSON parity.

Interactive runtime and external courses
- Runtime v2: Enforce audience binding across `event`, `checkpoint.save/load`, `asset.sign-url`; consider idempotency keys for `progress/grade`.
- Registry: Add search/status filters + pagination; enforce teacher/course scoping on assignment target linking.
- Security: Fail-fast on missing RS256 keys in prod when `RUNTIME_API_V2=1`; expand per-endpoint rate limits/scopes.

Database migrations (supabase/migrations)
- Add helpful indexes for paginated reads (`created_at`, FKs); verify query plans.
- TTL/cleanup for `events` and large telemetry tables; schedule or policy.
- Constraints: ensure uniqueness for read receipts if used; verify foreign-key cascades.
- Update `docs/data-model.md` with `progress` RLS and teacher-read policy.

Observability and ops
- Metrics: Extend in-memory metrics to track saturation; expose via admin/internal endpoints.
- Logging: Ensure `dash_*` and `progress_marked` logs; standardize redaction and levels.
- Scripts: Keep `scripts/metrics-alert.js` thresholds aligned; document envs in README.

Env validation
- Harden `@education/shared` server env loader: validate CSP, CORS, rate-limit knobs, metrics token; fail-fast in prod.
- Add boot checks for `TEST_MODE` guard in prod.

Docs and examples (docs/**)
- Update `docs/api.md` with pagination, examples, and runtime v2 notes.
- Keep `docs/observability.md` and `docs/backend-readiness.md` in sync.

Testing
- Unit: Negative tests for strict query/body, DTO response validation (400/500 paths).
- E2E (Playwright): Smoke for dashboard, mark lesson complete, messaging read-all, notifications read-all, reports CSV.
- Mutation testing (later): Stryker on `progress`, `assignments`, `submissions` services.

Acceptance criteria
- All list endpoints support standard pagination + `x-total-count`.
- Problem envelope + `x-request-id` on every error path; DTO-validated responses.
- Runtime v2 security and registry filters enforced; env validation fail-fast in prod.
- Metrics endpoints expose p50/p95/error counts; logs include dashboard/progress events.
- Unit + smoke e2e green; docs updated.
