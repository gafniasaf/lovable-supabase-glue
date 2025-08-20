### Coder A — Frontend/UI/UX Checklist (run in TEST_MODE)

Do (owned areas)
- `apps/web/src/app/**` (pages/layout/components)
- `apps/web/src/components/**`
- `apps/web/src/lib/data/**` (gateway interfaces + TestGateway + HttpGateway)
- `apps/web/src/lib/testStore.ts`, `apps/web/src/lib/testMode.ts`
- Storybook config (to be added)

Don’t Touch
- `apps/web/src/app/api/**`, `apps/web/src/server/**`, `supabase/migrations/**`, `packages/shared/src/schemas/**`

Setup
1) Start dev in TEST_MODE: `npm --workspace apps/web run dev:test` (http://localhost:3020)
2) Seed demo: open `/api/test/seed?hard=1`. Use the header role switcher.

Tasks (execute in order)
1) Create gateway layer — COMPLETED
   - Path: `apps/web/src/lib/data/`
   - Implemented files: `courses.ts`, `lessons.ts`, `assignments.ts`, `submissions.ts`, `quizzes.ts`, `messages.ts`, `notifications.ts`, `files.ts`, `reports.ts`, `profiles.ts`, `modules.ts`, `announcements.ts`, `providers.ts`, `parentLinks.ts`, `dashboard.ts`, `progress.ts`
   - Each file exports: `type <Domain>Gateway`, `createTestGateway()`, `createHttpGateway()`, `create<Domain>Gateway()`.
   - Selection via `isTestMode()`; HTTP calls validate with Zod.

2) Migrate dashboards to gateways — COMPLETED (prod pages)
   - Student/Teacher/Admin dashboards now use `DashboardGateway` and domain gateways for notifications and details.
   - Teacher course detail uses `LessonsGateway` (progress/per-student via existing API for now).
   - Core flows migrated: Student assignment submit, Student quiz play; Teacher lessons new/manage, quizzes manage/attempts, assignments list/submissions.

3) Storybook (visual, a11y)
   - Add Storybook with a TestGateway provider decorator.
   - Stories: Dashboard (student/teacher), Course Admin lists, Grading queue, Quiz runner, Profile.

4) UX polish
   - Notification bell: mark read/read-all.
   - Profile editor: display name, bio, avatar (FilesGateway in Test mode).
   - Assignment detail: status, submit form, feedback section; update teacher grading UI.

5) Accessibility & testability
   - Add `data-testid` for key actions; ensure keyboard navigation.

Exit criteria
- Pages work fully in TEST_MODE with seeded data; stories render; E2E smoke passes locally.
- Gateways cover all production pages; no direct `serverFetch` in prod dashboards.


### Current frontend to-do plan (independent track)

Scope/ownership
- Only touch: `apps/web/src/app/**` (except `api/**`), `apps/web/src/components/**`, `apps/web/src/lib/**`, `apps/web/src/stories/**`.
- Do not touch: `apps/web/src/app/api/**`, `apps/web/src/server/**`, `supabase/migrations/**`, `packages/shared/src/schemas/**` (unless coordinated with B).

App shell and components
- Finalize tokens and variants in `components/ui/*` (Button, Input, Select, Tabs, DataTable, Card, Toast).
- Add Storybook stories for common patterns; keep visual regressions scoped to components.

Gateways and data access (`apps/web/src/lib/data`)
- Use Gateways for all SSR/server components; no direct service imports.
- If a screen needs extra fields before backend changes, add local transforms and extend `createTestGateway()` to synthesize data in `TEST_MODE`.

Role dashboards (`apps/web/src/app/dashboard/**`)
- Student: Continue-learning CTA; per-course progress; skeleton/empty/error states; “Mark complete” calling `/api/lessons/complete`.
- Teacher: KPIs (active courses, needs grading), recent courses, link to grading queue; paginate lists.
- Admin: KPIs (users, courses, DAU), recent activity table.

Profile & settings
- Profile form with Zod validation; avatar upload via FilesGateway; optimistic update with rollback.
- Settings: `GET/PATCH /api/notifications/preferences` with success/error toasts.

Assignments & grading polish
- Student assignment detail: status, due date, submit (text/file); feedback display.
- Teacher grading queue: inline score/feedback, optimistic updates, keyboard shortcuts.

Analytics light
- Teacher analytics: completion %, score trend, active students/week via ReportsGateway; CSV download.
- Ensure charts render <500ms; fallback to tables for large datasets.

Gamification scaffold
- XP card, achievements, leaderboard backed by stub data (test-mode).
- Non-blocking rendering; lazy load data where possible.

Notifications and real-time feel
- Use `useNotificationsPoll` to poll every 15s; invalidate lists after submit/grade; header badge and dropdown actions (mark read/read-all).

External courses UI
- Admin catalog: search/filter/status badges; version management shell via RegistryGateway.
- Teacher assignment picker: show source badges (native/v1/v2); integrate `Picker.tsx`.
- Student launch: resilient WebEmbed with resume/offline indicator; checkpoint badge.

Accessibility and UX
- Add `@axe-core/playwright` checks to new pages; ensure no violations.
- Keyboard navigation, focus rings, aria labels for forms/dialogs/menus.

Testing
- Unit: data transforms, form schemas, loading/empty/error state components.
- E2E: dashboard per role, submit→grade flow, profile update, notifications dropdown, analytics CSV, external launch (test-mode).

Acceptance criteria
- All dashboards/rendered lists have skeletons and empty/error states; actions are optimistic with rollback.
- Gateways isolate FE from backend changes; test-mode provides realistic data.
- A11y checks pass; key flows covered in E2E.

