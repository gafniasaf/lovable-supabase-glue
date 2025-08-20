### Parallel Development Guide (Coders A, B, C)

This document defines how three developers can work in parallel without conflicts while driving the UI/UX to 100% parity and keeping backend development unblocked.

Roles
- Coder A — Frontend/UI/UX (Next.js App Router, components, pages, gateway, Storybook)
- Coder B — Backend/API/DB (API route handlers, services, Supabase migrations, shared schemas)
- Coder C — QA/Automation (unit, smoke, e2e; accessibility and visual checks)

Key principle: UI uses a thin gateway layer that can point at either the real backend or an in-memory TestGateway, so A can finish the UX before backend endpoints exist.

Gateway seam
- Location: `apps/web/src/lib/data/*`
- Expose per-domain interfaces: `CoursesGateway`, `LessonsGateway`, `AssignmentsGateway`, `SubmissionsGateway`, `QuizzesGateway`, `MessagesGateway`, `NotificationsGateway`, `FilesGateway`, `ReportsGateway`, `ProfilesGateway`.
- Implementations:
  - `TestGateway`: uses in-memory `testStore` and the test-mode API helpers; owned by Coder A.
  - `HttpGateway`: fetches Next API routes; owned by Coder A, but implementation details map 1:1 to Coder B’s route contracts.
- Swap via `isTestMode()` so pages/components stay backend-agnostic.

Ownership map (Do/Don’t Touch)
- Coder A (Frontend)
  - DO: `apps/web/src/app/**` (pages/components/layout), `apps/web/src/components/**`, `apps/web/src/lib/data/**` (gateway + TestGateway), `apps/web/src/lib/testStore.ts`, `apps/web/src/lib/testMode.ts`, Storybook config (to be added), CSS/Tailwind.
  - DO: client helpers: `supabaseBrowser.ts`, hooks, small utilities.
  - DON’T: `apps/web/src/app/api/**`, `apps/web/src/server/services/**`, `supabase/migrations/**`, `packages/shared/src/schemas/**` (unless coordinated PR with B).

- Coder B (Backend)
  - DO: `apps/web/src/app/api/**`, `apps/web/src/server/**` (services, apiHandler, withRouteTiming), `supabase/migrations/**`, `packages/shared/src/schemas/**` (contracts), rate limits/security.
  - DON’T: `apps/web/src/lib/data/**` (gateway) and UI components/layout; avoid touching `testStore.ts` except when adding server-side test helpers.

- Coder C (QA)
  - DO: `tests/**` (Playwright specs/config, Jest tests), test shims, CI scripts under `.github/workflows/**` (if needed), docs under `docs/testing.md`.
  - DON’T: app code under `apps/web/**` except adding `data-testid` attributes requested via A’s PRs; DON’T edit schemas/migrations.

Branching and PR rules
- Branch names: `a/<feature>`, `b/<feature>`, `c/<feature>`.
- One domain per PR; avoid cross-cutting edits.
- Schema/migration changes originate from B; A adapts gateway; C updates tests.

Contracts and schemas
- Source of truth: `packages/shared/src/schemas/**` (owned by B).
- Any change must include: updated Zod schema, API route validation, and a short example in `docs/api.md`.
- A should not change schemas; instead, adapt UI by using optional fields and safe parsing until B’s schema lands.

#### Ground rules for independence (summary)

- Backend-only paths: `apps/web/src/app/api/**`, `apps/web/src/server/**`, `supabase/migrations/**`, `packages/shared/src/{schemas,dto}/**`, `docs/**`, `scripts/**`.
- Frontend-only paths: `apps/web/src/app/**` (except `api/**`), `apps/web/src/components/**`, `apps/web/src/lib/**`, `apps/web/src/stories/**`.
- Contracts ownership: Backend owns `packages/shared` contracts/DTOs. When changing response shapes, prefer additive, versioned exports (e.g., `dashboardResponseV2`) and keep legacy types until FE cuts over.
- Feature flags & Test Mode: FE develops against Gateways with `TEST_MODE=1` and should not block on new BE endpoints. BE keeps non-MVP routes behind flags like `MVP_PROD_GUARD` where needed.
- Error and tracing discipline: Every route returns a Problem envelope and echoes `x-request-id`; FE uses Gateways/`serverFetch` to forward headers automatically.
- Coordination cadence: 15-minute weekly contract review; otherwise default to asynchronous PR comments. No cross-area edits without agreement.

Test-mode data and seeds
- Owned by A and C. Endpoints:
  - `/api/test/seed?hard=1` (GET/POST) — idempotent rich seed
  - `/api/test/switch-role` (POST) — set `x-test-auth` cookie
- Extend seeds via querystring only; avoid touching backend tables.

Work plan per coder
- Coder A (Frontend)
  1) Create `apps/web/src/lib/data/` with gateway interfaces + TestGateway (no backend needed).
  2) Migrate `dashboard/*`, `teacher/*` pages to use gateways.
  3) Add Storybook with TestGateway providers; ship stories for Dashboard, Course Admin, Grading, Quiz Runner, Profile.
  4) Implement notification bell, profile editor, assignments UI polish, analytics tiles (via ReportsGateway).
  5) A11y cleanup in UI; add `data-testid` attributes on critical controls for QA.

- Coder B (Backend)
  1) Stabilize contracts in `packages/shared/src/schemas/**` per domain (courses, lessons, enrollments, assignments, submissions, quizzes, messages, announcements, notifications, files, reports).
  2) Implement/finish API handlers in `apps/web/src/app/api/**` delegating to `src/server/services/**`; keep Zod validation + error envelope.
  3) Supabase migrations and RLS refinements (see `supabase/migrations/**`). Provide convenience views/indices; keep tests in mind.
  4) Add rate limits and CSRF guards where flagged in `docs/architecture.md`.
  5) Write unit tests for services in `tests` workspace (under `tests/unit` or `tests/server`), coordinated with C.

- Coder C (QA)
  1) Maintain Playwright smoke and full E2E suites (`tests/e2e/specs/**`).
  2) Add coverage for: seed/roles, course/lesson, assignments/grading, quizzes, messaging, announcements/modules, reports (JSON/CSV), files upload/download, profile/notifications.
  3) Add axe accessibility checks on key pages; store traces/videos on failure.
  4) Optional visual diffs for Storybook (when enabled).
  5) Keep `docs/testing.md` updated; ensure CI runs smoke on PRs and full on `main`.

Avoiding conflicts
- A owns `apps/web/src/lib/data/**` and UI files; B does not edit there.
- B owns `apps/web/src/app/api/**`, `src/server/**`, `packages/shared/src/schemas/**`, `supabase/migrations/**`; A does not edit there.
- C owns `tests/**`; A/B avoid editing test specs except by request.
- Shared files that might conflict (coordinate via PR comments):
  - `docs/api.md` (B as lead author; A/C may add examples/test notes)
  - `docs/ui-ux.md` (A as lead; B supplies contract links)
  - `README.md` and `docs/testing.md` (A/C may edit; keep sections scoped)

Backlogs and current plans
- Frontend (Coder A) plan and to-do list: see `docs/tasks/coder-A.md` (section “Current frontend to-do plan (independent track)”).
- Backend (Coder B) plan and to-do list: see `docs/tasks/coder-B.md` (section “Current backend to-do plan (independent track)”).

Daily flow
- A runs on their port: `set DEV_ID=alice; set WEB_PORT=3022; npm --workspace apps/web run dev:test`, seeds demo (`/api/test/seed?namespace=alice`), builds UX against TestGateway.
- B runs `set DEV_ID=bob; set WEB_PORT=3023; npm --workspace apps/web run dev` with real env, iterates routes/services.
- C runs `npm run smoke-test` locally and in CI; full `npm run e2e` pre-merge on larger PRs.

Definition of Done
- Feature PR merges when: UI stories pass in Storybook (A), contracts validated and handlers tested (B), E2E + a11y checks pass (C). Update relevant docs.


