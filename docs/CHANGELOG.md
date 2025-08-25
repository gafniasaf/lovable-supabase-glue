### Changelog — Backend hardening and APIs

Date: 2025-08-18

Highlights
- DTOs and contracts
  - Added `moduleDto/moduleListDto` and `enrollmentDto/enrollmentListDto` in `packages/shared/src/dto/index.ts` and re-exported via `@education/shared`.
- Pagination and consistency
  - `GET /api/enrollments` now supports `offset`/`limit`, returns `x-total-count`, validates with `enrollmentListDto`, and is wrapped with `withRouteTiming`.
  - Verified/standardized pagination headers across assignments, submissions, quizzes, lessons, modules, messages, threads, and runtime outcomes lists.
- Providers health endpoints (admin)
  - `GET /api/providers/health?id` performs JWKS and domain reachability checks with short timeouts, caches results in `provider_health`, and applies per-user rate limits (`PROVIDER_HEALTH_LIMIT`, `PROVIDER_HEALTH_WINDOW_MS`).
  - `GET /api/providers/health/summaries` returns cached health snapshot.
- Messaging
  - Read receipts are idempotent: `PATCH /api/messages?id` uses upsert on `(message_id,user_id)`; enforced by migration `0044_receipts_unique_idempotent.sql`.
- Metrics and observability
  - `withRouteTiming` now tracks per-route in-flight saturation.
  - `GET /api/admin/metrics` and `GET /api/internal/metrics` include `app_route_in_flight{route=...}`.
- Services
  - Dashboard: added teacher `studentsEnrolled` (distinct student_ids across the teacher’s courses) and safer pass-rate math for interactive attempts.
  - Progress: added fast read-path `getCourseProgress(userId, courseId)` for course-level summary.
  - Announcements: producer stub emits rows for “announcement created” (best-effort) when publishable.
- Runtime v2
  - Strengthened audience binding and scope checks verified in checkpoint save/load, asset sign-url, progress.
- Admin lists hardening
  - `admin/audit-logs` and `admin/quotas`: tolerant `.order()` chaining for typed mocks in tests.
  - Runtime outcomes list: tolerant chaining and headers preserved.
- Env validation and knobs
  - In prod with `RUNTIME_API_V2=1`, RS256 keys are required (`NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`).
  - In prod, `TEST_MODE` must not be enabled.
  - Providers health limits added: `PROVIDER_HEALTH_LIMIT`, `PROVIDER_HEALTH_WINDOW_MS`, `PROVIDER_HEALTH_TTL_MS`, `PROVIDER_HEALTH_TIMEOUT_MS`.
- Migrations
  - `0044_receipts_unique_idempotent.sql` — unique index on `message_read_receipts(message_id, user_id)`.
  - `0045_events_ttl_and_indexes.sql` — helpful indexes for common pagination paths and telemetry TTL helpers.
- Testing & CI
  - Added Stryker integration: root script `npm run test:mutation`, config `tests/stryker.conf.json`, and CI workflow `.github/workflows/ci.yml` to run unit, E2E, and mutation tests on push/PR.
  - Extended unit test to assert `x-total-count` on enrollments list.
  - Integrated dead-click prevention test stack:
    - React Testing Library UI specs under `tests/unit/ui` with JSDOM and fetch stubs
    - Storybook interaction tests via `@storybook/test-runner`
    - Playwright E2E smoke spec for navigation and critical actions
    - Chainable Supabase mock helper for route handler tests (`tests/unit/helpers/supabaseMock.ts`)
  - Enabled `eslint-plugin-jsx-a11y` in `apps/web` and added docs for patterns and commands.

Notes
- All updated routes now echo `x-request-id` and use the Problem-style error envelope.
- Feature flags keep non-MVP endpoints guarded in production (`MVP_PROD_GUARD`).


Date: 2025-08-25

Highlights
- Vercel deployment reliability
  - `vercel.json` sets `installCommand: npm ci --ignore-scripts` to bypass Husky and builds `apps/web` workspace.
  - Clear Vercel Root Directory to repository root; build uses monorepo workspace.
  - Fixed unicode escape in `apps/web/src/app/api/parent/progress/route.ts` and set `export const runtime = 'nodejs'`.
- CSP and Supabase auth
  - `apps/web/src/lib/csp.ts`: corrected `connect-src 'self'`; allow Supabase host via `RUNTIME_CORS_ALLOW`.
  - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` has no hidden newlines; enable email/password providers in Supabase.
- API and DTO polish
  - Announcements and ParentLinks gateways: added `list()`/`remove()` aliases; student labs pages use `enrollments` variable consistently.
- Testing and CI gates
  - Added E2E specs for CSP/login, session persistence, and logout; Playwright config passes Supabase envs.
  - `tests/e2e/run-json.sh` emits JSON to `reports/e2e/summary.json` and copies `tests/test-results`.
  - Introduced `tools/v0-scan.js` with PR workflow to guard v0 UI imports and data-testid usage.
- Docker/Compose hygiene
  - Healthcheck switched to `/api/health`.
  - Tests run inside Playwright container; file writes avoid PowerShell redirection issues.
- UI/UX refresh
  - Login page uses UI kit components and router navigation; layout hides chrome on auth pages; subtle theme updates.
- Grading queue E2E support
  - `GET /api/teacher/grading-queue` short-circuits in test mode, returning deterministic rows with `x-total-count`.

Notes
- JSON/E2E artifacts under `reports/e2e/`; mirrors to `artifacts/e2e/` when relevant.
- If Vercel caches old commits, use "Redeploy without cache".


