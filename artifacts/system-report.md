### System Readiness Report — Education Platform v2 (100% Delivery)

This document summarizes the final, production‑ready system across architecture, capabilities, security, performance, operations, and quality. It consolidates information from the codebase and documentation into a single reference for engineering, QA, DevOps, and stakeholders.

## Executive summary
- **Status**: All milestones M0–M9 delivered; system is deployable with green unit, UI, E2E, a11y and mutation tests; security and observability baselines are in place.
- **Architecture**: Modular monolith (Next.js App Router) with clean domain seams and shared contracts via Zod. Frontend Gateways and Test Mode enable parallel development and deterministic tests.
- **Security**: Supabase RLS, CSRF (origin + optional double‑submit), rate limits, strict JWT practices (RS256 in prod), hardened headers, and test‑mode guardrails.
- **Operations**: Dockerized builds, health checks, metrics endpoints, environment validation, and runbooks. Vercel deployment supported.
- **Scalability**: Extraction gates defined; background jobs isolated; per‑route SLOs; metrics and alerts configured.

## Business capabilities (delivered)
- **Dashboards**: Student, Teacher, Parent, Admin dashboards with role‑aware widgets (courses, assignments, submissions, notifications, analytics tiles).
- **Content management**: Courses, modules, lessons (CRUD, reorder), lesson completion tracking and progress.
- **Enrollments & Profiles**: Student enrollments with pagination; profile edit (display name, avatar, preferences).
- **Assignments & Grading**: Teacher CRUD, student submissions (text/file), teacher grading with feedback; grading queue API.
- **Quizzes**: Quiz builder (questions/choices), student attempts (start, save, submit), grading and reporting.
- **Messaging & Notifications**: Threads, participants, messages, read receipts; notification list and preferences.
- **Files & Media**: Presigned upload/download URLs with quotas and MIME allowlist; attachments on lessons, announcements, and submissions.
- **Interactive Runtime v2**: WebEmbed launch via short‑lived JWT; runtime bearer exchange; progress, grade, events, checkpoints, and asset signing with scopes and CORS controls.
- **External Course Registry**: Providers, external courses, course versions, assignment targets; admin catalog with health checks and export endpoints.
- **Analytics & Reporting**: Event capture and materialized reports (teacher engagement, admin usage); CSV/JSON exports.
- **Admin & Governance**: Roles, parent links, quotas, audit logs, provider governance (versions, status), usage counters and DLQ/replay.

## Architecture overview
- **Monorepo structure**
  - `apps/web`: Next.js 14 (App Router) application (pages, API routes, server services).
  - `packages/shared`: Shared Zod schemas and env helpers (single source of truth for contracts).
  - `tests`: Jest (node + JSDOM), Playwright, a11y checks, mutation tests, Cypress (optional).
  - `supabase/migrations`: SQL schema and RLS policies.
  - `docs`: Architecture, API, data model, testing, observability, deployment, ADRs.
- **Layering**: Pages → Frontend Gateways (`src/lib/data/*`) → Route Handlers → Services (`src/server/services/*`) → DB (Supabase Postgres with RLS).
- **Contracts‑first**: All entities, request bodies, and response DTOs defined in Zod; both API inputs and responses are validated at the boundary.
- **SSR correctness**: Gateways call HTTP routes (not direct DB), preserving SSR semantics and standardized error handling.

## API surface (condensed catalog)
- Health & admin: `/api/health`, `/api/admin/metrics`, `/api/internal/metrics` (token), `/api/admin/quotas`
- Auth & profiles: `/api/auth/logout`, `/api/user/profile`, `/api/user/role`
- Content: `/api/courses`, `/api/modules`, `/api/lessons`, lesson reorder/complete
- Enrollment: `/api/enrollments`
- Assignments/Submissions: `/api/assignments`, `/api/submissions`, teacher grading, grading queue
- Quizzes: `/api/quizzes`, `quiz-questions`, `quiz-choices`, `quiz-attempts` (start/save/submit)
- Messaging: `/api/messages`, `messages/threads`, read‑all
- Notifications: `/api/notifications`, `/api/notifications/preferences`
- Files: `/api/files/upload-url`, `download-url`, `finalize`
- Announcements: `/api/announcements`
- Parent links: `/api/parent-links`
- Interactive runtime v2: `/api/enrollments/[id]/launch-token`, `/api/runtime/{auth/exchange,progress,grade,events,checkpoint/save,checkpoint/load,asset/sign-url}`
- Registry & Providers: `/api/registry/{courses,versions}`, `/api/providers`, `providers/health`, `providers/health/summaries`, outcomes exports

Conventions:
- Pagination (`offset`, `limit`) with `x-total-count` header.
- Standard Problem envelope `{ error: { code, message }, requestId }` on all errors.
- All responses echo `x-request-id`.

## Data model (key tables)
- Core: `profiles`, `courses`, `lessons`, `modules`, `enrollments`, `assignments`, `submissions`, `announcements`.
- Quizzes: `quizzes`, `quiz_questions`, `quiz_choices`, `quiz_attempts`, `quiz_answers`.
- Messaging: `message_threads`, `message_thread_participants`, `messages`.
- Files & quotas: `files`, `attachments`, `user_quotas` (admin editable), usage counters.
- Parents: `parent_links`.
- Interactive/Registry: `course_providers`, `external_courses`, `course_versions`, `assignment_targets`, `runtime_checkpoints`, `user_aliases`, `course_events`.
- Reliability: `dead_letters`, `usage_counters`.

Indexes and constraints cover frequent joins and pagination: enrollments by student/course, content by course+order, submissions by assignment/student, quiz joins by quiz/question/attempt.

## Roles and permissions
- Roles: `student`, `teacher`, `parent`, `admin`.
- App‑layer enforcement per route (teacher‑only writes to course content; student submissions; admin role updates; parent reads own links).
- RLS enforces row‑level access: teacher ownership on content; students read only enrolled content; submissions owned by student; teachers grade for their courses; parents read their links.

## Security posture (prod)
- **Auth**: Supabase session cookies for SSR and APIs.
- **CSRF**: Origin/Referer checks on non‑GET in handler wrapper; optional double‑submit token (cookie `csrf_token` equals header `x-csrf-token`).
- **Rate limits**: Global per‑IP for mutations; per‑feature limits (submissions, grading, messaging, uploads, runtime v2) with `retry-after`, `x-rate-limit-reset` headers.
- **Headers**: CSP (nonce; dynamic `frame-src` for embeds), HSTS (prod), Referrer‑Policy, X‑Content‑Type‑Options, X‑Frame‑Options, Permissions‑Policy, COOP/CORP; optional COEP.
- **JWT/JWKS**: Launch tokens RS256‑signed in prod; runtime v2 bearer tokens validated; provider outcomes via JWKS with caching and audience binding; one‑time nonce enforcement.
- **Test‑mode guard**: Prod rejects any `x-test-auth`; `TEST_MODE` must be unset.
- **Files**: MIME allowlist; sanitized filenames; optional max bytes; ownership enforced on presign/finalize and downloads.

## Validation and contracts
- Zod as the source of truth for inputs and response DTOs (shared package).
- Route handlers wrap via `createApiHandler({ schema, preAuth, handler })` to standardize validation, CSRF/rate‑limit, error envelopes, and request‑id echo.
- Query params validated via `parseQuery(req, schema)`.

## Observability & performance
- **Logs**: Structured Pino logs with `requestId`, `ms`, `route_success|route_error`, and contextual fields (dev id, branch, commit).
- **Metrics**: In‑memory per‑route counters and latency percentiles (p50/p95/p99) and in‑flight saturation exposed at `/api/admin/metrics`; internal Prometheus endpoint at `/api/internal/metrics` gated by token.
- **Tracing**: `x-request-id` generated in middleware and propagated across SSR → API → services; echoed on errors.
- **SLOs**: Dashboard p95 < 800ms (p99 < 1500ms); health p95 < 200ms; route error rate < 0.5% over 5m. CI alert job enforces budgets.

## Testing & quality
- **Unit (Jest)**: Services and route helpers with high gates (services ≥95%, routes ≥90%).
- **UI (JSDOM)**: Component interactions and state handling.
- **E2E (Playwright)**: Multi‑role projects; health‑gated startup; role via `x-test-auth`; traces/videos retained on failure; a11y checks with zero critical violations required.
- **Mutation (Stryker)**: Applied to critical domains (assignments, submissions, progress) to harden logic.
- **Contract pings**: Nightly budget checks hit public endpoints and fail on latency regressions.
- **Artifacts**: Test results, videos, and reports stored under `reports/` and `artifacts/`.

## Environments & configuration
- **Env validation**: Central schema enforces presence/shape of secrets and flags; app fails fast when invalid.
- **Key flags**:
  - Runtime: `INTERACTIVE_RUNTIME=1`, `RUNTIME_API_V2=1`, `RUNTIME_CORS_ALLOW`, JWKS TTL.
  - Security: `CSRF_DOUBLE_SUBMIT=1`, global mutation limits, per‑feature limits.
  - Guards: `MVP_PROD_GUARD`, `TEST_MODE` (must be off in prod).
  - Jobs: `DUE_SOON_JOB`, `DATA_RETENTION_JOB` with intervals/TTLs.

## Deployment & operations
- **Docker**: Multi‑stage Next.js build to standalone; non‑root runtime; `PORT=3022` by default.
- **Compose**: `web` service with `/api/health` healthcheck; `tests` service runs Playwright E2E and exports artifacts.
- **Vercel**: Project configured with Next.js root `apps/web`; environment variables for Supabase and runtime tokens required.
- **Runbooks**: Health verification, security smoke (reject `x-test-auth`, inspect headers), metrics budgets, and seed/reset flows documented.
- **Secrets rotation**: Runtime keys rotated via documented scripts; JWKS caching TTLs configurable.
- **Migrations**: Idempotent SQL in `supabase/migrations`; RLS managed and reviewed; backup/restore procedures documented.

## Scalability & service extraction
- **Default**: Stay as a modular monolith until contention/scale justify extraction.
- **Gates**: Split when at least two hold true—deploy contention, divergent scaling, incident isolation, background work hurting latency, clear data ownership/security isolation benefits.
- **Approach**: Keep contract compatibility; generate OpenAPI from Zod; typed clients; forward `x-request-id` across services.

## Accessibility & UX quality
- E2E integrates `@axe-core/playwright`; critical pages must report zero critical violations. UI uses semantically correct components and data‑testids for automation.

## Data privacy & governance
- PII minimization: aliases for provider runtimes; redact sensitive logs; scope tokens; origin‑bound JWT audience.
- Data retention jobs clean up stale objects; quotas enforced via admin API.
- Governance for providers/courses includes versioning, status, conformance guidelines, and audit logs.

## Risks & mitigations (current posture)
- Misconfigured env/keys → mitigated by fail‑fast env validation and CI checks.
- CSRF bypass attempts → mitigated by origin/double‑submit, runtime path exceptions documented and tested.
- Abuse of write endpoints → per‑feature rate limits and audit logs; DLQ and replay for failure handling.
- TEST_MODE leakage → prod guard rejects role headers; CI checks assert guard behavior.

## Useful commands
- Dev (test mode): `set WEB_PORT=3022&& npm --workspace apps/web run dev:test`
- Smoke locally: `npm run smoke-test`
- Full E2E: `npm run e2e`
- Build → start: `npm --workspace apps/web run build && set PORT=3022&& npm --workspace apps/web run start`
- Compose (local): `docker compose up --build` (web + tests)

## References
- Architecture: `docs/architecture.md`
- API: `docs/api.md`
- Data model: `docs/data-model.md`
- Testing: `docs/testing.md`
- Observability: `docs/observability.md`
- Deployment: `docs/DEPLOYMENT.md`
- Security: `docs/security.md`
- Rate limits & idempotency: `docs/rate-limits-and-idempotency.md`
- Modified approach: `docs/approach-modified.md`


