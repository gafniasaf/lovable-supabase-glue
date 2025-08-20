### Architecture

This repo is a small monorepo with three main parts:

- apps/web: Next.js 14 (App Router) application
- packages/shared: shared Zod schemas and env helpers
- tests: Jest unit tests and Playwright end-to-end tests

#### Key building blocks

- Auth/DB: Supabase (supabase-js + auth-helpers-nextjs)
- Data validation: Zod
- Styling: Tailwind CSS
- Logging: Pino

#### Directory map (selected)

- apps/web/src/app: App Router pages and API route handlers
  - api/*: `health`, `user/profile`, `user/role`, `courses`, `courses/[id]`, `lessons`, `lessons/reorder`, `enrollments`, `modules`, `assignments`, `submissions`, `parent-links`, `quizzes`, `quiz-questions`, `quiz-choices`, `quiz-attempts`, `quiz-attempts/submit`, `notifications`, `notifications/preferences`, `files/upload-url`, `files/download-url`, `files/resolve`, `files/attachment`, `reports/*`, `dashboard`, `test/reset`, `__test__/reset`
  - dashboard/* (server components) — now use a gateway layer for data access
  - interactive runtime: `enrollments/[id]/launch-token`, `runtime/{events,outcomes}`
  - external courses (Phase 1 implemented): `runtime/{auth,context,progress,grade,events,checkpoint,asset}` and `registry/{courses,versions}`; Phase 2 adds `bundles`
- apps/web/src/server: server-only helpers
  - apiHandler.ts (schema validation + error envelope)
  - withRouteTiming.ts (timing + Pino logs)
  - services/ (courses.ts, lessons.ts, modules.ts, assignments.ts, submissions.ts, quizzes.ts, quizAttempts.ts, parentLinks.ts, users.ts)
- apps/web/src/lib: utilities and data access
  - env.ts (client env access)
  - supabaseClient.ts and supabaseServer.ts
  - logger.ts, testMode.ts, testStore.ts, serverFetch.ts
  - data/* — Frontend Gateways. One module per domain exporting:
    - `type <Domain>Gateway`
    - `createHttpGateway()` (calls Next.js API routes, validates with Zod)
    - `createTestGateway()` (delegates to HTTP; APIs are test-mode aware)
    - `create<Domain>Gateway()` (chooses Test vs Http via `isTestMode()`)
    - Implemented: `courses`, `lessons`, `assignments`, `submissions`, `quizzes`, `messages`, `notifications`, `files`, `reports`, `profiles`, `modules`, `announcements`, `providers`, `parentLinks`, `dashboard`, `progress`
- supabase/migrations: SQL schema and RLS policies

#### Request flow

1) apps/web/middleware.ts injects a per-request ID header `x-request-id`.
2) API routes and some handlers are wrapped with `withRouteTiming(...)` to emit structured logs and durations.
3) Route handlers build with `createApiHandler({ schema, handler })` validate inputs with Zod and standardize error responses.
4) Auth is read via Supabase cookies in server components/route handlers. In test-mode, a cookie `x-test-auth` provides a synthetic role.
5) Data persistence uses supabase-js to access Postgres tables protected by RLS. Frontend pages call domain-specific Gateways, which in turn call the Next.js API routes (HTTP) to preserve SSR semantics and reuse validation.

#### Auth model

- Real auth: Supabase session cookies (via `@supabase/auth-helpers-nextjs`). Utilities create clients bound to `cookies()`.
- Test-mode: When `TEST_MODE=1` (or running Playwright), SSR/routes consider `x-test-auth` cookie or header (`teacher|student|parent|admin`) and synthesize a user with that role. This enables full test automation without external auth dependency.

#### Services vs routes

- Domain logic for `courses` and `lessons` lives in `apps/web/src/server/services/*`.
- Services consult `isTestMode()` to either use an in-memory store (`testStore.ts`) or real DB via Supabase.
- API routes focus on auth/role checks, input validation, and mapping HTTP requests to service calls. Frontend Gateways are thin clients on top of these routes and validate responses with Zod.

#### Shared contracts

- `packages/shared/src/schemas/*` provide request/response and entity schemas used by both server and tests. Examples:
  - `courseCreateRequest`
  - `lessonCreateRequest`
  - `profileResponse`
  - Interactive runtime (current): `launchTokenClaims`, `runtimeEvent`, `outcomeRequest`
  - External courses (planned): `ExternalCourse`, `CourseVersion`, `AssignmentTarget`, `AuthExchange`, `ContextResponse`, `ProgressUpsert`, `GradeSubmit`, `EventEmit`, `Checkpoint*`, `AssetSignUrl`

---

### Service strategy and modular boundaries

This codebase is a modular monolith with clean domain seams that map to future services:

- Courses/Modules/Lessons
- Enrollments/Profiles
- Assignments/Submissions
- Quizzes/Questions/Attempts
- Parent Links/Announcements
- Messaging (Threads/Messages/Participants)
- Notifications
- Files (signed URLs/attachments)
- Analytics/Events/Reports

MVP add-ons:
- `dashboard.ts` and `progress.ts` services provide role dashboards and lesson completion.

We will keep a monolith through early milestones, then extract a minimal set of services when it reduces contention and enables independent scaling.

#### Decision gates to split

Extract a service when at least two are true:

- Parallel change streams cause deploy contention between components or releases
- Hotspots need different scaling profiles (e.g., messaging throughput, analytics batch)
- Incidents in one domain unduly impact others
- Background/queue workloads contend with web latency budgets
- Data ownership and security isolation are clearer with service boundaries

#### Ports and adapters (now)

- Define per-domain ports in `apps/web/src/server/services` (e.g., `MessagingPort`, `NotificationsPort`, `AnalyticsPort`).
- Route handlers depend on these ports; implementations are in-process today and can later call out-of-process services without changing route code.

#### Contracts

- Continue using Zod schemas in `packages/shared` as the source of truth.
- Generate OpenAPI from Zod for service endpoints and publish a typed client consumed by the Next.js app. For SSR pages, prefer Gateways over ad-hoc fetches.
 - Error responses use a consistent Problem envelope `{ error: { code, message }, requestId }`.

#### Events and outbox

- Emit domain events to an `events` table (see data model) from write paths.
- Use an outbox pattern to reliably publish notifications, analytics, and other cross-context reactions.

#### Background jobs

- Introduce a lightweight job queue (e.g., Redis + BullMQ) for notifications fanout, grading, and scheduled tasks.
- Propagate `x-request-id` into jobs for traceability.

#### Service-to-service communication (later)

- Keep a single gateway (Next.js API routes) initially; route calls to internal services via `serverFetch`, forwarding `x-request-id`.
- Use JWT-based auth (Supabase-issued or service-signed short-lived tokens) for service-to-service calls.

#### Observability across services

- Keep structured logs with `service`, `route`, and `requestId` fields. Redact PII by default.
- Measure per-endpoint latency, error rate, and saturation; export metrics to a central backend.
- Interactive runtime logs: `runtime_event_received`, `runtime_outcome_saved` with `requestId` and nonce for correlation.
- Enforce consistent error envelopes and always echo `x-request-id`.

#### Security posture (MVP hardening)

- Test-mode guard: ignore/deny `x-test-auth` in non-test environments; assert `TEST_MODE` unset in prod.
- CSRF: validate `Origin/Referer` on non-GET routes and optional double-submit token (`CSRF_DOUBLE_SUBMIT=1`) on sensitive mutations.
- Rate limiting: per-IP and per-user on auth-sensitive and write-heavy endpoints.
- Headers: add CSP, HSTS, Referrer-Policy, Permissions-Policy. Restrict `frame-ancestors`; tune `connect-src` for interactive providers.
- Request IDs: generate with `crypto.randomUUID()` in middleware.
- JWT launch tokens: require RS256 in prod; HS256 disabled in prod builds.

#### External Course Ecosystem (status)

- Data model: `external_courses`, `course_versions`, `assignment_targets`, `user_aliases`, `course_events` implemented; `runtime_checkpoints` added; DLQ/usage counters planned
- APIs: `/api/registry/{courses,versions}` implemented; runtime v2 endpoints `/api/runtime/{auth,context,progress,grade,events,checkpoint,asset}` implemented (events/checkpoint/asset recently wired with bearer auth); `bundles` planned
- UI: Minimal Admin Course Catalog and Teacher Assignment Picker present; Student launch includes groundwork for checkpoints
- Security: pseudonymous per-provider aliases, origin-bound tokens (aud=provider origin), dynamic CSP `frame-src`; per-endpoint rate limits expanding

#### First extractions (target M4–M6)

- Communications Service: Messaging + Notifications (rate limits, queues, fanout)
- Analytics Service: Events ingestion and report materialization
- Optional Files Signer: stateless signed URL issuance (+ attachments metadata)

Security gates for extraction:
- Apply per-service rate limits; propagate `x-request-id` and `service` labels across hops and jobs.

Keep Postgres co-located initially (shared cluster, separate schema or namespaces). Consider isolating databases once traffic and operational needs justify it.

