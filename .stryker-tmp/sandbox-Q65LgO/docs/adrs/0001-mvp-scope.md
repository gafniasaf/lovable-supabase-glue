### ADR 0001 — MVP scope and execution plan

Status: Accepted

Date: 2025-08-15

#### Context

- The codebase is a modular monolith (Next.js App Router) with Supabase (Auth + Postgres + RLS), Zod contracts, and extensive tests (Jest + Playwright + Cypress).
- Domains present: Auth/Roles, Courses/Lessons/Modules, Enrollments, Assignments/Submissions, Quizzes, Parent Links, Messaging, Notifications, Files, Analytics.
- Goal: Ship an MVP with role dashboards and minimal course/lesson flows, keeping non-essential domains dormant behind flags.

#### Decision

In-scope for MVP:
- Role-aware dashboards (student/teacher/admin) backed by a single `GET /api/dashboard` endpoint.
- Course/lesson minimal flows: list lessons, mark lesson completion.
- Basic observability (request IDs, route timing) and smoke tests; deploy to Vercel.

Out-of-scope (deferred behind flags):
- Messaging, Notifications, rich grading workflows, file uploads, advanced quiz features, and analytics dashboards.

Approach:
1) Contracts-first in `packages/shared/src/schemas` (single source of truth):
   - Dashboard: `DashboardStudent`, `DashboardTeacher`, `DashboardAdmin`, and discriminated `DashboardResponse`.
   - Lessons/Progress: `LessonSummary`, `MarkLessonCompleteRequest`, `Progress` shapes.
   - Standard error envelope: `Problem { code, message, details?, requestId }` (align with existing error JSON; keep 400 for validation for now).

2) Minimal API surface in `apps/web/src/app/api`:
   - `GET /api/dashboard` → returns `DashboardResponse` based on caller role.
   - `POST /api/lessons/complete` → body: `MarkLessonCompleteRequest`, returns progress payload.
   - Wrap with `createApiHandler({ schema, handler })` and `withRouteTiming(...)`. Ensure `x-request-id` echoed on responses.

3) Services layer in `apps/web/src/server/services` (thin, deterministic):
   - `dashboard.ts`: `getDashboardForUser(userId, role)` builds widgets via existing services (courses, enrollments, lessons).
   - `progress.ts`: `markLessonComplete(userId, lessonId)` and `getLessonCompletionMap(userId, courseId)`.

4) UI/UX in `apps/web/src/app`:
   - `/dashboard/page.tsx`: server component calls `serverFetch('/api/dashboard')` and renders role-specific widgets with skeletons/empty states.
   - `/dashboard/*` subpages may reuse existing teacher/student pages; focus on minimal tiles (counts, recent items).
   - `/courses/[courseId]/page.tsx`: list lessons with order index and a “Mark complete” button calling `/api/lessons/complete` (optimistic UI).

5) Data model & RLS (Supabase):
   - Add `progress(user_id, lesson_id, completed_at)` with PK `(user_id, lesson_id)`; enable RLS:
     - Students can select/insert/delete where `user_id = auth.uid()`.
     - Optional teacher read when owning the course (for dashboard summaries).
   - Profiles role: DB currently allows `student|teacher|parent`. Keep `admin` as app-layer only for MVP, or alter the check to include `'admin'` if DB-level recognition is desired.

6) Observability:
   - Route timing and request ID propagation already exist. Add simple timings inside `getDashboardForUser` and counters for `progress_marked` via logs.

7) Deployment:
   - Vercel app at `apps/web`; set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `NEXT_PUBLIC_BASE_URL`).
   - Post-deploy smoke: `GET /api/health`, open `/dashboard`.

#### Work plan (PR-sized tasks)

- Contracts (shared)
  - Add `Problem`, `LessonSummary`, `MarkLessonCompleteRequest`, `Progress` schemas.
  - Add `DashboardStudent`, `DashboardTeacher`, `DashboardAdmin`, `DashboardResponse`.

- Database (migrations)
  - Create `progress` table + RLS (+ unique PK `(user_id, lesson_id)`).
  - Optional: extend `profiles.role` check to include `'admin'`.

- Services
  - `getDashboardForUser(userId, role)` with unit tests (seeded deterministic outputs).
  - `markLessonComplete(userId, lessonId)` and `getLessonCompletionMap` with unit tests.

- API
  - `GET /api/dashboard` + handler-level tests (401/403/200, error envelope, `x-request-id`).
  - `POST /api/lessons/complete` + handler-level tests.

- UI
  - Build `/dashboard` with role-aware rendering, skeletons, empty states.
  - Update course page lessons list with completion CTA and optimistic updates.

- Testing
  - Unit: services and API handlers.
  - E2E (Playwright): per-role project using `x-test-auth`.
    - Student: dashboard → course → mark complete → UI updates.
    - Teacher: create course → add lessons → dashboard shows course.
    - Admin: dashboard loads basic stats.
  - Smoke spec: `/api/health`, `/api/dashboard`(teacher), create course, student sees course, mark a lesson complete.

- Observability
  - Ensure new endpoints log `route_success|route_error` with `{ requestId, ms }`.
  - Add lightweight internal timings for dashboard widget assembly.
  - Add counters for `progress_marked` when lesson completion is recorded.

- Docs
  - Update `docs/data-model.md` with `progress` table + RLS snippets.
  - Keep `docs/api.md` up to date with dashboard and completion endpoints.
  - Document Problem envelope and validation status code (400 for MVP).

#### Acceptance criteria

- Role-based dashboards render using standardized schemas.
- Students can mark a lesson complete and see progress reflected.
- Unauthorized paths blocked by RLS and app-layer checks (negative tests included).
- All responses echo `x-request-id`; error envelope matches `Problem`.
- CI green: unit + e2e smoke under `TEST_MODE=1`.
- Deployed build passes post-deploy smoke.

#### Notes & risks

- Validation status code: current `createApiHandler` returns 400 on Zod errors. Keep 400 for MVP; revisit 422 later if desired.
- `admin` role in DB: optional migration; app-layer enforcement is sufficient for MVP.
- Non-MVP domains remain behind feature flags (existing flags endpoint is test-mode only; keep prod flags dormant).

#### References

- Architecture: `docs/architecture.md`
- Data model & RLS: `docs/data-model.md`
- API: `docs/api.md`
- Testing: `docs/testing.md`
- Observability: `docs/observability.md`


