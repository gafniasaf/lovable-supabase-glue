### Product Plan — Education Platform (Rebuild)

This plan turns the functional description into an actionable engineering roadmap aligned with the existing monorepo (Next.js App Router, Supabase, Zod, Jest/Playwright). It maps epics to data model, APIs, UI, tests, and observability.

Links:
- Architecture: `docs/architecture.md`
- Data model: `docs/data-model.md`
- API: `docs/api.md`
- Roles: `docs/roles.md`
- Testing: `docs/testing.md`
- Observability: `docs/observability.md`

#### Goals
- Deliver a reliable, testable platform covering courses/lessons, assignments/submissions, quizzes, parent portal, messaging, notifications, analytics, and admin.
- Keep roles/permissions simple at first, with room for growth.
- Maintain deterministic tests via test-mode; production uses Supabase with RLS.

 - Support parallel delivery with minimal coordination overhead via clear module boundaries and gradual service extraction where it materially reduces contention or enables independent scaling.

#### Non-Goals (initially)
- Real-time chat (websockets) beyond minimal polling/long-poll.
- Complex LTI or SIS integrations.
- Rich WYSIWYG/editor with collaboration.

---

## Epics, Scope, and Deliverables

### Epic S: Security & Stability
- Scope: Lock down auth, RLS, CSRF, rate limiting, headers, and JWT verification.
- Data: Add strict RLS for `assignments`, `submissions`, `notifications`, and interactive tables.
- APIs: Reject `x-test-auth` in prod; enforce `Origin/Referer` on non-GET; add rate limits on sensitive routes.
- Runtime: Require RS256 for launch tokens in prod; verify provider JWT via JWKS for outcomes; enforce nonce one-time-use.
- Headers: Add CSP, HSTS, Referrer-Policy, Permissions-Policy; restrict `frame-ancestors`, tune `connect-src`.
 - Headers: Add CSP, HSTS, Referrer-Policy, Permissions-Policy; restrict `frame-ancestors`, tune `connect-src` and `frame-src`; optional double-submit CSRF token.
- Observability: Ensure error envelope + `x-request-id` across all routes; metrics for latency/error.
- Docs/Tests: Update `docs/api.md`, `docs/architecture.md`, `docs/data-model.md`, `docs/observability.md`, `docs/testing.md`; add security tests.
- Tracking: See `docs/TODO.md` for the detailed checklist.

### Epic A: Core Courses and Content (baseline hardening)
- Scope: Courses, Modules, Lessons end-to-end with ordering and read-only student views.
- Data: Tables are in place (`courses`, `modules`, `lessons`).
- APIs: CRUD present; ensure idempotent sorting and consistent error envelopes.
- UI: Teacher dashboards (read + print), student overview/planner/timeline (labs implemented as references).
- Tests: Expand unit for service sort/insert; e2e for course/lesson creation and student browse.
- Observability: Ensure request id, route timing on critical endpoints.

### Epic B: Assignments and Submissions
- Scope: Create assignments, students submit (text + optional file), teachers grade with feedback.
- Data: `assignments`, `submissions` tables exist. Extend to support file attachments via storage.
- APIs: `POST/GET/PATCH/DELETE /api/assignments`, `POST/GET/PATCH /api/submissions` (exists; extend for grading states).
- UI: Teacher grading queue; Student submission form; Read-only submission list with score/feedback.
- Tests: Unit for grading logic; e2e for create->submit->grade flow.
- Observability: Count grading latency; log grading outcomes.

### Epic C: Quizzes and Assessments
- Scope: Quizzes with questions and choices, student attempts with autosave, auto-grading.
- Data: `quizzes`, `quiz_questions`, `quiz_choices`, `quiz_attempts` present; finish contracts and edge cases.
- APIs: Finalize POST/PATCH/GET for quizzes and attempts; ensure submit returns graded results.
- UI: Student quiz runner (timed), Teacher quiz management and attempts review.
- Tests: Unit for grading; e2e attempt lifecycle (start -> answer -> submit -> score).

### Epic D: Parent Portal Enhancements
- Scope: Parents browse linked children, view study summaries, announcements.
- Data: `parent_links` exists. Add `announcements` (per course).
- APIs: `GET /api/parent-links` (exists). Add `POST/DELETE/GET /api/announcements` (teacher writes, everyone reads per course).
- UI: Parent children directory (exists in labs) -> polish + announcements surface.
- Tests: e2e for parent flows (list + detail + announcements view).

### Epic E: Messaging (MVP)
- Scope: Role-scoped messaging (teacher<->student, teacher<->parent, admin broadcast). MVP async inbox with read receipts.
- Data (new):
  - `message_threads(id, created_at)`
  - `message_thread_participants(thread_id, user_id, role, added_at)`
  - `messages(id, thread_id, sender_id, body, created_at, read_at nullable)`
  - Optional: `message_recipients(message_id, user_id, read_at)` if per-message receipts preferred.
- APIs:
  - `POST /api/messages/threads` (create or find existing by participants)
  - `GET /api/messages/threads` (list user’s threads)
  - `GET /api/messages/threads/[id]` (messages in thread, pagination)
  - `POST /api/messages` (send into thread)
  - `PATCH /api/messages/[id]/read` (read receipt)
- UI: Inbox, thread view, composer, unread badges.
- Tests: Unit for permission checks; e2e inbox + message send + read.

 - Service extraction plan:
   - Phase 1 (M5): Implement as in-process module via `MessagingPort` with Zod/OpenAPI contracts generated; stand up a sibling `comms` service skeleton that shares contracts.
   - Phase 2 (M6): Proxy API routes to the service behind a feature flag; add rate limits and background jobs for fanout; keep Postgres co-located initially.

### Epic F: Notifications (MVP)
- Scope: In-app notifications for grades posted, new messages, due dates, announcements.
- Data (new): `notifications(id, user_id, type, payload jsonb, created_at, read_at nullable)`.
- APIs: `GET /api/notifications` (list), `PATCH /api/notifications/[id]` (mark read), optional `PATCH /api/notifications/read-all`.
- Triggering: Server-side on relevant writes (grade posted, message stored, assignment due soon via scheduled task).
- UI: Bell dropdown, unread count badge, settings surface (MVP just list + mark read).
- Tests: Unit for producers; e2e for notification creation and display.

 - Integrates with the Communications Service extraction plan.

### Epic G: Analytics and Reporting (MVP)
- Scope: Capture key events and expose reports.
- Data (new): `events(id, user_id nullable, event_type, entity_type, entity_id, ts, meta jsonb)`.
- Producers: API handlers and server utilities emit events.
- Reports: Teacher course engagement, grade distribution; Admin system usage.
- APIs: `GET /api/reports/*` endpoints (server-generated JSON/CSV) and/or SSR report pages.
- UI: Teacher analytics (table/CSV), Admin analytics dashboard.
- Tests: Unit for event transforms; e2e report rendering and CSV download.

 - Service extraction plan:
   - Phase 1 (M7): Introduce a standalone Analytics Service for event ingestion/materialization while maintaining shared Zod/OpenAPI contracts.
   - Phase 2: Gradually move report endpoints behind the service and keep a small compatibility layer in Next.js API.

### Epic H: Files and Media
- Scope: File upload for lessons (attachments), assignment submissions, and announcements.
- Storage: Supabase Storage buckets (`lesson-assets`, `submissions`, `announcements`).
- Data (new, optional): `attachments(id, owner_type, owner_id, url, content_type, created_at)` for cross-entity linking.
- APIs: `POST /api/files/upload-url` (signed URL), `GET /api/files/download-url` (signed URL), integrate into existing flows.
- UI: Upload controls; inline preview for common types.
- Tests: e2e happy path with small files; unit for signature logic.

 - Optional: Extract a stateless Files Signer service for signed URL issuance if needed.

### Epic I: Access Control & Permissions Management UI
- Scope: Admin UI to assign roles, manage parent links, and grant course-level privileges.
- Data: Uses existing `profiles` + `parent_links` + course ownership.
- APIs/UI: Admin pages to update roles (`PATCH /api/user/role` exists), CRUD parent links (exists), course ownership transfer (new endpoint).
- Tests: e2e role update + permission gating.

### Epic J: Admin & Ops
- Scope: Admin dashboard for health, logs, and alerts; config toggles for feature flags.
- Observability: Extend request timing, structured logs, and test-mode health cards to production pages.
- CI: Nightly test runs; per-PR test+lint+typecheck.
- Tests: E2E smoke and synthetic checks; latency histograms (labs) can seed real dashboards.

Additions delivered:
- Admin audit logs API (`GET /api/admin/audit-logs`) and UI table in `dashboard/admin/audit`.
- Admin export endpoint (`GET /api/admin/export?entity=...&format=csv|json`).

---

## Data Model Additions (Supabase)

Tables to add via migrations (names tentative):
- `announcements(id uuid pk, course_id uuid, teacher_id uuid, title text, body text, publish_at timestamptz null, created_at timestamptz)`
- `message_threads(id uuid pk, created_at timestamptz)`
- `message_thread_participants(thread_id uuid, user_id uuid, role text, added_at timestamptz, primary key(thread_id, user_id))`
- `messages(id uuid pk, thread_id uuid, sender_id uuid, body text, created_at timestamptz, read_at timestamptz null)`
- `notifications(id uuid pk, user_id uuid, type text, payload jsonb, created_at timestamptz, read_at timestamptz null)`
- `events(id uuid pk, user_id uuid null, event_type text, entity_type text, entity_id text, ts timestamptz, meta jsonb)`
- Optional `attachments(id uuid pk, owner_type text, owner_id uuid, url text, content_type text, created_at timestamptz)`

RLS (high level):
- `announcements`: teachers can write for their courses; enrolled students/parents can read; public listing restricted.
- `messages`: participants only (thread-based RLS via join checks).
- `notifications`: owner user only.
- `events`: admin read; writes by server only (service role) or relaxed in dev.
- `attachments`: read via signed URLs; metadata row readable by owners/admin.

---

## API Additions (Contracts Sketch)

- Announcements
  - `POST /api/announcements` { course_id, title, body, publish_at? } -> 201 row
  - `GET /api/announcements?course_id=...` -> 200 list
  - `DELETE /api/announcements?id=...` -> 200 { ok: true }

- Messaging
  - `POST /api/messages/threads` { participant_ids[] } -> 201 thread
  - `GET /api/messages/threads` -> 200 threads for current user
  - `GET /api/messages/threads/[id]` -> 200 messages (paginated)
  - `POST /api/messages` { thread_id, body } -> 201 message
  - `PATCH /api/messages/[id]/read` -> 200 message

- Notifications
  - `GET /api/notifications` -> 200 list
  - `PATCH /api/notifications/[id]` { read: true } -> 200 row
  - `PATCH /api/notifications/read-all` -> 200 { ok: true }

- Files
  - `POST /api/files/upload-url` { owner_type, owner_id, content_type } -> 200 { url, fields }
  - `GET /api/files/download-url?id=...` -> 200 { url }

- Analytics
  - `POST /api/events` { event_type, entity_type, entity_id, meta } -> 204
  - `GET /api/reports/course-engagement?course_id=...`
  - `GET /api/reports/grade-distribution?course_id=...`

All routes should use `createApiHandler` for validation and `withRouteTiming` for logs.

---

## UI Surfaces (Selected)

- Student
  - Dashboard: enrollments, due dates, notifications, messages
  - Courses: lesson reader, assignments list, quiz runner

- Teacher
  - Dashboard: courses, grading queue, analytics
  - Course admin: lessons, modules, assignments, quizzes, announcements
  - Messaging: threads by course or participant

- Parent
  - Children overview, learning digest/timeline, announcements; messaging with teachers

- Admin
  - Role management, parent links, system health & logs, feature flags

---

## Testing Strategy

- Unit (Jest): services, API contract validators, sort/order logic, permission checks
- E2E (Playwright):
  - Core flows (course/lesson creation, enrollment, planner/timeline)
  - Assignments: create -> submit -> grade
  - Quizzes: create -> attempt -> submit -> grade
  - Messaging: create thread -> send -> read
  - Notifications: create (grade posted) -> render in UI
  - Parent views: directory + detail + announcements

Nightly: full e2e; PR: smoke subset.

---

## Workstream topology and ownership

- Curriculum: Courses/Modules/Lessons, Assignments/Submissions, Quizzes.
- Communications & Insights: Messaging, Notifications, Events/Analytics, Files signer.

Path-based ownership and per-package/build caching in CI keep builds/test times low. Shared contracts live in `packages/shared` and generate OpenAPI + typed clients.

---

## Observability & Ops

- Continue request-id propagation and timing for all new APIs.
- Emit `events` for key user actions (analytics) and track error rates.
- Admin health pages surface recent latency histograms and uptime tile.

- Cross-service: standardize `requestId`, `service` labels, and per-route latency/error metrics; forward `x-request-id` across SSR, API, and background jobs.

---

## Rollout Plan

1) Schema migrations (backward compatible), feature flags for new surfaces.
2) Implement APIs + SSR pages behind flags. Define ports and generate OpenAPI clients.
3) Add tests; green CI. Introduce background jobs and outbox events.
4) Start Communications Service extraction (M5–M6) and Analytics Service (M7) with proxy cutovers behind flags.
5) Enable features by role, migrate real data if present.

---

## Risks & Mitigations

- Messaging privacy/abuse: enforce participant checks and rate-limits; admin audit access.
- Notification noise: allow mark-all-read and basic preferences.
- Storage security: use signed URLs and short expirations; virus scanning optional backlog.
- Analytics cost/size: compact `events.meta`, aggregate periodically.

## Interactive Course Integration (Update)

- See ADR 0002.
- First release targets:
  - WebEmbed launch via short-lived JWT (`/api/enrollments/[id]/launch-token`).
  - Runtime events (postMessage): `course.ready`, `course.progress`, `course.attempt.completed`, `course.error`.
  - Provider outcomes webhook: POST `/api/runtime/outcomes`.
  - Course form fields: `launch_kind`, `launch_url`, `scopes`.
  - Teacher dashboard surfaces interactive attempts.

---

### External Course Ecosystem — Phased Roadmap (Post‑MVP)

This expands the platform into a marketplace‑ready ecosystem with external courses (bundled v1 and cloud‑hosted v2), a registry, hardened runtime APIs, governance, and quality bars.

#### Phase 1 — Registry, Assignment Linking, Runtime API v2 core
- Data model (new tables):
  - `external_courses(id, vendor_id, kind, title, description, version, status, launch_url, bundle_ref, scopes, created_at)`
  - `course_versions(id, external_course_id, version, status, manifest_hash, launch_url, created_at, released_at, rolled_back_from)`
  - `assignment_targets(assignment_id, source, external_course_id, version_id, lesson_slug, launch_url, attempt_rules jsonb, grading_policy jsonb)`
  - `interactive_attempts`: add `assignment_id` and `runtime_attempt_id` uniqueness
  - `runtime_audit_logs(id, request_id, kind, course_id, user_id, provider_id, payload jsonb, created_at)`
  - `user_aliases(id, user_id, provider_id, alias, created_at)`
  - `course_events(id, course_id, user_id, assignment_id, type, payload jsonb, request_id, created_at)`
- Shared schemas:
  - Runtime v2: `AuthExchange`, `ContextResponse`, `ProgressUpsert`, `GradeSubmit`, `EventEmit`, `CheckpointSave/Load`, `AssetSignUrl`
  - Registry: `ExternalCourse`, `CourseVersion`, `AssignmentTarget`, `AttemptRules`, `GradingPolicy`
- APIs:
  - Registry CRUD/search under `/api/registry/{courses,versions}`
  - Assignment linking in `/api/assignments` via `target` payload → `assignment_targets`
  - Runtime v2 endpoints under `/api/runtime/{auth,context,progress,grade,event,checkpoint,asset}`
- UI:
  - Admin Course Catalog (search, approve/disable versions, tenant scoping)
  - Teacher Assignment Picker (source: native, v1 bundle lesson, v2 external)
  - Student Launch UI with resume/offline indicators (checkpoints)
- Security/compliance:
  - Pseudonymous aliases per provider (`user_aliases`); origin‑bound tokens; dynamic CSP `frame-src` per assignment; rate limits per user/course/provider
- Observability:
  - `x-request-id` propagation; append runtime/course events to `course_events`; basic admin dashboards
- Acceptance criteria:
  - Teacher links assignment to external entry; student launches; progress/grades sync; CSP/origin enforced; PII minimized via aliases

#### Phase 2 — v1 Bundles, Validator, Authoring Studio
- Data model:
  - `bundle_storage(id, storage_key, checksum, size, created_at)`
  - `bundle_lessons(id, external_course_id, version_id, slug, title, order_index, asset_refs jsonb)`
- Schemas/tooling:
  - Zod + JSON Schema for v1 manifests; CLI `bundle-validator` (CI‑friendly)
  - Vendor SDK (JS/TS) for v2: `init()`, `getContext()`, `saveProgress()`, `submitGrade()`, `emitEvent()`, `checkpoint.save/load()`, `signAssetUrl()`
- APIs:
  - `/api/registry/bundles/{import,validate}` with idempotency (bundleId+version)
- UI:
  - Web Authoring Studio (internal): create/edit bundles, live preview, reorder, export
- Acceptance criteria:
  - Import validated bundle; assign specific lesson; student launch + progress works

#### Phase 3 — Observability, Dead‑letters, Quotas, Admin Analytics
- Data model:
  - `dead_letters(id, kind, payload jsonb, error, next_attempt_at, attempts, created_at)`
  - `usage_counters(day, provider_id, course_id, metric, count, storage_bytes, compute_minutes)`
- APIs/services:
  - Admin DLQ list/replay; usage counters endpoint; background jobs for retries and daily aggregation
- UI:
  - Admin analytics for quotas, error rates; event stream viewer (query `course_events`)
- Acceptance criteria:
  - Failed writes visible + replayable; quotas visible per course/provider

#### Phase 4 — Governance, Licensing, Vendor Portal, Conformance, Mutation Testing
- Data model:
  - `licenses(id, provider_id, tenant_id, external_course_id, seats_total, seats_used, expires_at, status)`
  - `tenant_visibility(external_course_id, tenant_id, allowed)`
- APIs/services:
  - License enforcement in launch/assignment flows; version pinning & instant rollback
  - Vendor Portal for uploads, logs, usage, licenses; automated checks (validator, endpoints health)
- Quality bar:
  - Hosted conformance harness for Runtime API; mutation testing gates on critical paths; per‑area coverage thresholds
- Acceptance criteria:
  - Version pin/rollback; seat enforcement; vendors pass conformance before listing

Feature flags: `EXTERNAL_COURSES`, `RUNTIME_API_V2`, `AUTHORING_STUDIO`, `BUNDLE_IMPORTER`, `GOVERNANCE`, `VENDOR_PORTAL`.

---

## External Courses Ecosystem — Execution Checklist (to 100%)

This checklist mirrors and expands the TODOs to align scope and acceptance criteria with concrete deliverables. All items include docs and tests updates.

1) Registry completeness
- Search/pagination/status filters/vendor scoping on `GET /api/registry/courses`
- Kind-specific validation on create; soft-delete and partial updates with role checks
- Version workflows: approve/disable; unique (external_course_id, version)

2) Assignment targets
- Persist/validate `assignment_targets` on create/edit; RLS for teachers of the course
- Launch derives provider origin and CSP allowlist from target

3) Admin Catalog UI
- Search/filters, version management, vendor/tenant scoping, CSV/JSON export

4) Runtime v2 endpoints
- Events: runtime-bearer auth + scopes + rate limit + persistence in `course_events`
- Checkpoints: `runtime_checkpoints` table; save/load with token auth and size caps; resume indicator in UI
- Asset sign URL: token auth, content-type allowlist, size caps, scope checks; reuse existing signer
- Idempotency keys for progress/grade (optional)
- Enforce `aud` across v2 endpoints; CORS allow per env + provider-origin

5) Security/Compliance
- Rate limits per endpoint (alias/course/provider); secrets/env hygiene checks at boot
- CSP dynamic `frame-src`; double-submit CSRF optional; privacy review of aliasing

6) Authoring & Tooling
- v1 bundle manifests + CLI validator; importer endpoints with idempotency
- Internal authoring studio
- Vendor SDK covering all v2 operations

7) Observability/Reliability
- DLQ with replay + jobs; usage counters; runtime audit logs; consistent `x-request-id`

8) Quality Bar
- Conformance harness for Runtime v2; mutation testing and area thresholds; load tests

9) Governance & Distribution
- Version pin/rollback; licensing/seats; vendor portal; tenant visibility controls

10) Migration & Backfill
- Native→registry wrapper; remap tool for `assignment_targets`; provider exports (anonymized)

See `docs/TODO.md` for the full, actionable list with acceptance criteria.




---

## Frontend Parity Plan — UI-first

Goal: achieve a comparable, modern frontend experience by layering UI/UX on top of the existing platform with minimal backend additions. Ship value incrementally; keep CI green with unit and e2e tests.

### Phases

P1 — App Shell & Design System (1–2 weeks)
- Integrate shadcn/ui with Tailwind; establish tokens and core primitives (Button, Input, Select, Dialog, Tabs, Card, DataTable, Toast).
- Role-aware layout/navigation in `src/app/layout.tsx` (sidebar, topbar, breadcrumbs, user menu).
- Notifications bell: unread badge + dropdown using `GET /api/notifications` and `PATCH /api/notifications?id=...` (optional `read-all`).

P2 — Role Dashboards (2 weeks)
- Student: upcoming assignments, per-course progress (derived), recent grades.
- Teacher: my courses, grading queue, recent announcements.
- Parent: linked children summary, each child’s progress + announcements.

P3 — Profile & Settings (1–2 weeks)
- Extend `profiles` with `display_name`, `avatar_url`, `bio`, `preferences jsonb`.
- Add `GET/PUT /api/user/profile` for current user updates.
- Profile page (editable), Settings (notification preferences MVP).

P4 — Assignments & Grading Polish (1–2 weeks)
- Student assignment detail: status, due dates, submission (text/file), feedback.
- Teacher grading UI: unified queue, inline score + feedback; rubric as structured text for now.
- File attachments via Supabase Storage and signed URLs.

P5 — Analytics Light (1–2 weeks)
- Teacher course analytics (completion %, average score trend, active students/week).
- Optional admin snapshot; render via server components; emit `events` for future reports.

P6 — Gamification UI Scaffold (1–2 weeks)
- XP card (level, progress), achievements gallery, leaderboard list.
- Backed by test-mode stub APIs now; wire to real endpoints later.

P7 — Real-time Feel (0.5 week)
- Poll notifications every 15s; invalidate data after submit/grade to simulate live updates.
- Encapsulate in a hook to swap to realtime later.

### Minimal schema/API additions
- Schema: `profiles(display_name, avatar_url, bio, preferences jsonb)`.
- API: `GET/PUT /api/user/profile` (current user only); `PATCH /api/notifications/read-all` (optional).

### Acceptance criteria
- Consistent app shell with role-aware navigation; responsive across breakpoints.
- Dashboards render real data with empty/error/loading states and pagination where relevant.
- Profile and settings edits persist; avatar upload works via Storage.
- Assignment submit→grade flow is polished; teacher grading queue efficient.
- Analytics page loads < 500ms on typical datasets; CSV export available for key tables.
- Gamification UI renders with stub data without blocking other pages.

### Testing
- Unit (Jest): layout primitives, dashboard data transforms, profile/settings validators, grading helpers.
- E2E (Playwright):
  - Sign-in → land on dashboard per role
  - Student submit → teacher grade → notification visible in bell
  - Profile update & avatar upload
  - Analytics light view renders and CSV export downloads
  - Gamification UI scaffold renders
