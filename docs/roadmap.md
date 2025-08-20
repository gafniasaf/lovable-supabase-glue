### Roadmap — Education Platform

Timeboxed, incremental milestones. Each milestone ends with green unit + e2e tests and deployable build.

#### M0 — Baseline hardening (current)
- Ensure install/build/test green on Node LTS.
- Lock SSR pages used by tests (labs) and core APIs (health, courses, lessons, enrollments).
- Add CI: typecheck, lint, unit, e2e smoke.
- Adopt MVP scope per ADR 0001: see `docs/adrs/0001-mvp-scope.md`.

Deliverables:
- Stable dev env + docs refresh.

#### M0.5 — Security hardening
- Strict RLS for assignments/submissions; test-mode guard (reject `x-test-auth` in prod)
- CSRF origin checks and basic rate limiting on sensitive routes
- Security headers (CSP, HSTS, Referrer-Policy, Permissions-Policy)
- Launch tokens: RS256-only in prod; provider JWT verification via JWKS; nonce one-time-use
- Request IDs via `crypto.randomUUID()`; unify error envelopes and `x-request-id`

Deliverables:
- Security tests pass; updated docs (API, Architecture, Data model, Testing, Observability); headers visible in responses (CSP includes connect-src/frame-src; optional double-submit token supported)

#### M0.7 — Hardening Sprint (Highest Priority)
- Owners: Coder B (backend/API/DB), Coder C (tests). Coder A unaffected except optional SDK/Storybook adoption.
- Day 6 (Validation First):
  - Add Zod to every API route; wrap all GETs with strict query schemas (course_id, pagination, filters).
  - Add `.strict()` to POST/PATCH schemas to reject unknown keys.
  - Introduce response DTOs under `packages/shared/src/dto/*` and parse responses before returning.
  - Negative tests (Coder C): bad query/extra key → 400; invalid DB value → 500 with requestId.
- Day 7 (Config & Environments):
  - Unified env validation in `packages/shared/src/env.ts`; fail-fast on missing/invalid secrets; rotation-ready keys.
  - Abstract Supabase keys into env; server-only schema validates at bootstrap.
- Day 8 (Access Control & Security):
  - Enforce negatives: student cannot read others’ submissions; teacher can’t grade another teacher’s course; file URLs scoped to owner/course.
  - Add rate limits for login, submissions, grading, messaging.
- Day 9 (Testing & Coverage):
  - Mutation testing (Stryker) on `services/{submissions,progress,assignments}` with ≥90% score.
  - UI critical flows (Coder A/C): login validation, assignment submission, quiz-taking.
- Day 10 (Developer Experience):
  - SDK wrapper `apps/web/src/lib/sdk.ts` to parse responses at boundary.
  - Storybook for core components (optional).
- Deliverables:
  - ≥90% coverage API routes (positive + negative), response DTO validation, unified env validation with fail-fast, SDK wrapper, mutation testing active.

#### M1 — Content and Student Views
- Courses/modules/lessons CRUD solidified; reorder lessons; print/export views.
- Student learning overview, planner, timeline, upcoming lessons finalized.
- Add CSV/JSON exports for teacher tools (catalog, audit).
  - Ship MVP dashboards and lesson completion per ADR 0001.
  - Plan interactive runtime integration per ADR 0002 (design + contracts).

Deliverables:
- Teacher content surfaces + student read-only flows fully tested.

#### M2 — Assignments & Submissions
- Implement assignment CRUD + submission create/list.
- Teacher grading UI with score + feedback.
- File attachments via signed URLs (MVP for submissions).

Deliverables:
- Create->submit->grade flow + tests.

#### M3 — Quizzes & Attempts
- Quiz builder (questions/choices) and student runner.
- Attempt lifecycle with autosave and submit grading.

Deliverables:
- Quiz attempt e2e happy path + unit grading correctness.

#### M3.5 — Interactive Runtime (WebEmbed)
- WebEmbed launch via short-lived JWT; outcomes webhook and runtime event intake.
- Course form fields (`launch_kind`, `launch_url`, `scopes`).

Deliverables:
- Interactive attempts appear in teacher dashboard; provider integration guide. [ADR 0002]

#### M4.0 — External Course Registry (Phase 1)
- Migrations: `external_courses`, `course_versions`, `assignment_targets`, `user_aliases`, `course_events`, audit logs extension
- APIs: `/api/registry/{courses,versions}`, runtime v2 core endpoints `/api/runtime/{auth,context,progress,grade,event,checkpoint,asset}`
- UI: Admin Course Catalog; Teacher Assignment Picker (native | v1 | v2); Student launch with resume/offline state
- Security: pseudonymous per-provider aliases; dynamic CSP `frame-src` per assignment; origin-bound tokens; extended rate limits

Deliverables:
- Teacher can link and students can launch external courses; progress/grades sync; aliases and CSP enforced

#### M5.0 — Bundles & Validator (Phase 2)
- v1 bundle manifest/types; CLI validator; importer endpoints; Authoring Studio (internal)

Deliverables:
- Bundle import/validate/assign flows; authoring preview working

#### M6.0 — Observability & Quotas (Phase 3)
- DLQ with replay endpoints and background jobs; usage counters and admin analytics; course event stream viewer

Deliverables:
- Failed writes replayable; quota dashboards operational

#### M7.0 — Governance & Vendor Portal (Phase 4)
- Version pinning/rollback; licensing/seats; vendor portal for uploads/logs/licenses; conformance harness; mutation testing gates

Deliverables:
- Governance and quality bars enforced prior to listing

---

### Milestone Addenda — External Courses to 100%

To reach complete ecosystem readiness, enrich the milestones with:

M4.1 — Runtime v2 completion
- Authenticate runtime bearer across `event`, `checkpoint.save/load`, `asset.sign-url`
- Add `runtime_checkpoints` table and resume UI; enforce audience and scopes consistently
- Add per-endpoint rate limits and idempotency keys (optional) for progress/grade

M4.2 — Admin Catalog + Assignment Target polish
- Catalog search/filters/vendor+tenant scoping; versions approve/disable; CSV/JSON export
- Teacher picker: v1 bundles and v2 courses with status/version badges

M6.1 — Reliability/Observability deepening
- DLQ with replay endpoints; background retry job; `usage_counters` aggregation and admin analytics
- Runtime audit logs (token exchange, checkpoint save, asset sign)

M7.1 — Governance & Quality bar
- Version pin/rollback flows; licensing/seats enforcement; vendor portal; tenant visibility controls
- Conformance harness for Runtime API v2; mutation testing thresholds in CI; load tests

M7.2 — Authoring & Tooling
- v1 bundle validator CLI and importer endpoints; internal authoring studio
- Vendor SDK (TS) for v2 runtime operations

#### M4 — Parent Portal & Announcements
- Parent directory + detail hardened; add announcements per course.
- Parent views for announcements and study digest.

Deliverables:
- Parent flows stable + tests.

#### M4.5 — Admin & Compliance
- Audit logs API and admin UI table (read-only)
- Admin export endpoint for CSV/JSON dumps (profiles, courses, assignments, submissions, notifications, events, messages)

Deliverables:
- Admin audit and export available behind admin role.

#### M5 — Messaging (MVP) — begin Communications Service extraction
- Threads, participants, messages; inbox + thread UI.
- Read receipts and unread badges.
 - Stand up Communications Service skeleton inside the monorepo (separate app/service) exposing the same Zod/OpenAPI contracts.
 - Route Next.js API to the in-process implementation first; add a feature flag to gradually proxy to the service.

Deliverables:
- Messaging e2e (send/read) + unit permission checks.

#### M6 — Notifications (MVP) — finalize Communications Service
- Notification storage, list, mark-read.
- Producers for grades posted, messages, due soon.
 - Introduce a lightweight job queue for notification fanout; propagate `x-request-id` across jobs.
 - Cut traffic over from in-process ports to the Communications Service behind the feature flag; keep tests green.

Deliverables:
- In-app notifications bell + smoke tests.

#### M7 — Analytics & Reporting — begin Analytics Service extraction
- Event capture; teacher course engagement report; admin usage dashboard.
- CSV/JSON export endpoints.
 - Stand up Analytics Service for event ingestion and report materialization; maintain contracts via OpenAPI generated from shared Zod.

Deliverables:
- Reports visible + downloadable with tests.

#### M8 — Files & Media
- Attachment model and signed URL APIs for lessons and announcements.
- Previews for common document/image types.
 - Optional: extract a small Files Signer service for signed URL issuance if traffic or security isolation warrants it.

Deliverables:
- Upload + render basic file types with tests.

#### M9 — Access Control & Admin Tools
- Admin UI for roles, parent links, and ownership transfers.
- Feature flags + configuration.

Deliverables:
- Admin management flows + smoke tests.

#### Ongoing — Observability, Performance, Security
- Request id, timing, percentiles on pages/APIs.
- Rate limits on messaging + sensitive routes.
- Nightly e2e + weekly dependency updates.
 - Service-aware logging and metrics; SLOs per service (latency, error rate, saturation). Centralize logs with a `service` label.

---

### Workstream topology

- Curriculum: Courses/Modules/Lessons, Assignments/Submissions, Quizzes.
- Communications & Insights: Messaging, Notifications, Events/Analytics, Files signer.

Path-based ownership and parallel CI minimize contention.

---

### Service split decision gates

Extract only when at least two are true:

- Deploy contention between independent workstreams
- Divergent scaling/SLA profiles
- Incident blast-radius concerns
- Background jobs disrupt web latency budgets
- Clear data ownership/security isolation benefits



### Frontend Parity — UI-first milestones

Goal: achieve a comparable frontend experience to KooBits by layering UI/UX on top of existing APIs and data, with minimal backend additions. Each phase ends with green unit + e2e tests and deployable build.

#### P1 — App Shell & Design System (1–2 weeks)
- Integrate shadcn/ui with Tailwind; establish tokens (colors, spacing, radii) and core components (Button, Input, Select, Dialog, Tabs, DataTable, Card, Toast).
- Role-aware layout in `src/app/layout.tsx`: sidebar/topbar, breadcrumbs, user menu.
- Notification bell with unread badge + dropdown using existing `GET /api/notifications` and `PATCH /api/notifications?id=...` (add `read-all` endpoint optionally).

Deliverables:
- Consistent shell + base components; notification dropdown; responsive nav.

#### P2 — Role Dashboards (2 weeks)
- Student: upcoming assignments, per-course progress (derived from submissions vs assignments), recent grades.
- Teacher: my courses, grading queue (ungraded submissions), recent announcements.
- Parent: linked children overview (via `parent_links`), each child’s progress + announcements.

Sources: `GET /api/courses`, `GET /api/assignments?course_id`, `GET /api/submissions?assignment_id`, `GET /api/notifications`.

Deliverables:
- Three dashboards with empty/error states, pagination, and loading skeletons.

#### P3 — Profile & Settings (1–2 weeks)
- Extend `profiles` with `display_name`, `avatar_url`, `bio`, `preferences jsonb` (migration).
- Thin wrapper APIs `GET/PUT /api/user/profile` for current user.
- Profile page (display name, bio, avatar upload), Settings (notification prefs MVP).

Deliverables:
- Editable profile/settings with server validation, optimistic updates, avatar upload to Supabase Storage.

#### P4 — Assignments & Grading Polish (1–2 weeks)
- Student assignment detail: clear status, due dates, submission form (text/file), feedback display.
- Teacher grading UI: unified grading queue, inline score + feedback; keep rubric as structured text for now.
- File attachments via existing signed-URL pattern.

Deliverables:
- Submit→grade flow polished; teacher grading productivity improvements.

#### P5 — Analytics Light (1–2 weeks)
- Teacher course analytics: assignment completion %, average score trend, active students this week.
- Admin snapshot (optional): totals and growth curves.
- Implement via server components (direct queries) without new heavy endpoints; optionally emit `events` for future reports.

Deliverables:
- Charts/tables that load < 500ms on typical data; CSV export for core tables.

#### P6 — Gamification UI Scaffold (1–2 weeks)
- XP card (level, progress), achievements gallery, leaderboard list.
- Backed by test-mode stub APIs now; wire to real endpoints later.

Deliverables:
- Non-blocking gamification surfaces rendering placeholder/stub data.

#### P7 — Real-time Feel (0.5 week)
- Poll `GET /api/notifications` every 15s; invalidate lists after submit/grade actions.
- Encapsulate in a hook to swap to WebSockets or Supabase Realtime later.

Deliverables:
- Perceived real-time updates without socket infra.

---

Exit criteria (parity-ready UI):
- Role dashboards, profiles/settings, polished assignment/grade flow, notifications dropdown, analytics light, and gamification UI scaffold are shipped with tests and documentation.