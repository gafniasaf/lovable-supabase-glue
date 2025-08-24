## Jest failures analysis and non-overlapping assignments (Coders A–D)

Date: 2025-08-21

### How to run tests locally
- **All unit (node) tests**: `npm run test`
- **Specific unit spec(s)**: `npm run test -- <path-or-glob>`
- **UI tests (jsdom)**: `npm run test:ui`
- **Specific UI spec**: `npm run test:ui -- <path-or-glob>`

### Major failure clusters (from latest reports)
- **Messaging routes (threads/messages/unread)**
  - Specs: `tests/unit/future.messaging.spec.ts`, `tests/unit/api.messages.threads-and-messages.spec.ts`, `tests/unit/api.messages.read-all.spec.ts`
  - Symptoms: unread is undefined or > 0 assertions fail; read-all returns 500; PATCH/GET flow issues.
  - Code focus: `apps/web/src/app/api/messages/**`, `apps/web/src/server/ports/messaging.ts`.

- **Supabase module resolution and test-time mocking**
  - Specs failing to run: `tests/unit/api.runtime.v2.spec.ts`, `tests/unit/api.runtime.spec.ts`, `tests/unit/api.flags.providers.users.spec.ts`, `tests/unit/api.admin.governance.smoke.spec.ts`, `tests/unit/api.files.download-url.permissions.spec.ts`, `tests/unit/api.admin.export.spec.ts`, `tests/unit/api.role.guard.matrix.extended.spec.ts`, others.
  - Symptoms: “Cannot find module '../../apps/web/src/lib/supabaseServer' from unit/helpers/supabaseMock.ts”.
  - Code focus: `tests/unit/helpers/supabaseMock.ts`, Jest moduleNameMapper, `apps/web/src/lib/supabaseServer.ts`.

- **Runtime v2 and headers/scopes/CORS**
  - Specs: `tests/unit/api.runtime.asset.sign-url.scope.spec.ts`, `tests/unit/api.submissions.rate-limit.spec.ts`, `tests/unit/api.runtime.checkpoint.scopes.spec.ts`, `tests/unit/api.runtime.events.scopes.spec.ts`, `tests/unit/api.parent-links.spec.ts`, `tests/unit/api.runtime.cors.headers.spec.ts`, `tests/unit/middleware.cors.disallowed-origin.spec.ts`.
  - Symptoms: Request URL parsing errors; wrong status codes for scope checks; missing/incorrect CORS headers.
  - Code focus: `apps/web/src/app/api/runtime/**`, middleware and CORS handling.

- **Library and UI consistency**
  - Specs: `tests/unit/lib.serverFetch.spec.ts`, `tests/unit/ui/StudentProfile.spec.tsx` (and occasionally `SystemAuthCheck.spec.tsx`).
  - Symptoms: `serverFetch` returns relative URL; UI shows wrong user email/role under test-mode.
  - Code focus: `apps/web/src/lib/serverFetch.ts`, `apps/web/src/lib/supabaseServer.ts`, UI pages/components reading current user and test-mode auth.

---

### Coder A — Messaging feature (threads/messages/unread)
- **Scope**
  - Code: `apps/web/src/app/api/messages/**`, `apps/web/src/server/ports/messaging.ts`.
  - Tests to turn green: `tests/unit/future.messaging.spec.ts`, `tests/unit/api.messages.threads-and-messages.spec.ts`, `tests/unit/api.messages.read-all.spec.ts`.
- **Goals**
  - Ensure thread listing includes numeric `unread` for current user.
  - `PATCH /api/messages/threads/[id]/read-all` returns 200 and zeros unread for caller.
  - Message create/list sorting and unread increment semantics per tests.
- **Run**
  - `npm run test -- tests/unit/future.messaging.spec.ts`
  - `npm run test -- tests/unit/api.messages.*.spec.ts`
- **Out-of-scope**
  - Supabase mocking infra; CORS; runtime v2 routes; library `serverFetch`.

- **Step-by-step**
  1) Run: `npm run test -- tests/unit/future.messaging.spec.ts`
  2) Implement unread count calculation on list (per current user) in `apps/web/src/app/api/messages/threads/route.ts` and/or `server/ports/messaging.ts`.
  3) Ensure `PATCH /api/messages/threads/[id]/read-all` updates participant read markers and returns 200.
  4) Verify sort by `created_at` desc for messages; ensure unread increments after new message for non-sender.
  5) Re-run messaging specs, then the two API messaging specs.
  6) Commit only files under `apps/web/src/app/api/messages/**` and `apps/web/src/server/ports/messaging.ts`.

### Coder B — Supabase test-time integration and module resolution
- **Scope**
  - Code: `tests/unit/helpers/supabaseMock.ts`, `tests/jest.config.cjs` mappings, minimal adjustments (if needed) to `apps/web/src/lib/supabaseServer.ts` to keep server-only and test-mode friendly.
  - Suites failing to run due to module resolution: `tests/unit/api.runtime.v2.spec.ts`, `tests/unit/api.runtime.spec.ts`, `tests/unit/api.flags.providers.users.spec.ts`, `tests/unit/api.admin.governance.smoke.spec.ts`, `tests/unit/api.files.download-url.permissions.spec.ts`, `tests/unit/api.admin.export.spec.ts`, `tests/unit/api.role.guard.matrix.extended.spec.ts`, etc.
- **Goals**
  - Fix path alias so `supabaseMock` reliably imports `@/lib/supabaseServer` in Jest.
  - Ensure mock returns chainable `.from().insert().update().delete().select().single()` and storage helpers; cover registry mutations tests.
  - Keep real implementations intact for non-mocked calls; default to test-mode behavior when `TEST_MODE=1`.
- **Run**
  - `npm run test -- tests/unit/api.runtime.v2.spec.ts`
  - Then expand to other “Test suite failed to run” specs until all execute.
- **Out-of-scope**
  - Fixing route business logic (assign to Coder C after suites execute).

- **Step-by-step**
  1) Open `tests/jest.config.cjs` and confirm alias mapping for `^@/(.*)$` → `../apps/web/src/$1` and that tests import `@/lib/supabaseServer`.
  2) Ensure `tests/unit/helpers/supabaseMock.ts` requires `@/lib/supabaseServer` (already present) and exports chainable mock that supports `.from().insert().update().delete().select().single()` and storage helpers.
  3) Fix any remaining path resolution by aligning `moduleNameMapper` in `tests/jest.config.cjs` with real file: `apps/web/src/lib/supabaseServer.ts`.
  4) Run: `npm run test -- tests/unit/api.runtime.v2.spec.ts`; iterate until it executes (may still fail assertions, which C owns).
  5) Run a sample of other previously “failed to run” specs to confirm execution.
  6) Do not modify business logic in runtime routes; restrict changes to config and mock infra.

### Coder C — Runtime v2, scopes, rate limits, and CORS
- **Scope**
  - Code: `apps/web/src/app/api/runtime/**`, CORS/middleware related modules.
  - Tests: `tests/unit/api.runtime.asset.sign-url.scope.spec.ts`, `tests/unit/api.submissions.rate-limit.spec.ts`, `tests/unit/api.runtime.checkpoint.scopes.spec.ts`, `tests/unit/api.runtime.events.scopes.spec.ts`, `tests/unit/api.parent-links.spec.ts`, `tests/unit/api.runtime.cors.headers.spec.ts`, `tests/unit/middleware.cors.disallowed-origin.spec.ts`.
- **Goals**
  - Make Request helpers accept absolute URLs; routes enforce scope and content-type correctly; correct 200/400/403 per specs.
  - Implement/adjust CORS headers for allowed origins from `RUNTIME_CORS_ALLOW` and ensure Vary/Origin behaviors per tests.
  - Parent-links and submissions rate-limit behaviors align with assertions.
- **Run**
  - `npm run test -- tests/unit/api.runtime.asset.sign-url.scope.spec.ts`
  - `npm run test -- tests/unit/api.runtime.cors.headers.spec.ts`
- **Out-of-scope**
  - Messaging domain; UI fixes; supabase module resolution.

- **Step-by-step**
  1) Start with `tests/unit/api.runtime.asset.sign-url.scope.spec.ts` and ensure route validates JWT scopes and content types; return 403 for missing scope, 200 for valid image, 400 for unsupported.
  2) Fix Request URL handling in routes that build or inspect URLs to avoid “Failed to parse URL” in tests.
  3) Implement/adjust CORS: read `RUNTIME_CORS_ALLOW`, set `access-control-allow-origin` when allowed, and adjust `Vary`/`Origin` per tests in `api.runtime.cors.headers.spec.ts` and `middleware.cors.disallowed-origin.spec.ts`.
  4) Align checkpoint/events scope checks to return expected statuses per tests; verify parent-links behavior.
  5) Re-run all listed runtime/CORS specs; then a small broader subset to catch regressions.
  6) Keep edits inside `apps/web/src/app/api/runtime/**` and CORS/middleware modules only.

### Coder D — Libraries and UI (serverFetch, auth display)
- **Scope**
  - Code: `apps/web/src/lib/serverFetch.ts`, UI components/pages reading current user in test-mode.
  - Tests: `tests/unit/lib.serverFetch.spec.ts`, `tests/unit/ui/StudentProfile.spec.tsx` (and `SystemAuthCheck.spec.tsx` if it regresses).
- **Goals**
  - `serverFetch` must build absolute URL from path using PORT/base env and propagate headers.
  - Under test-mode, ensure student/teacher role reflected per `x-test-auth` so email/role expectations match (`s@example.com`, `student`).
- **Run**
  - `npm run test -- tests/unit/lib.serverFetch.spec.ts`
  - `npm run test:ui -- tests/unit/ui/StudentProfile.spec.tsx`
- **Out-of-scope**
  - Runtime routes; messaging; Jest module resolution.

- **Step-by-step**
  1) Fix `apps/web/src/lib/serverFetch.ts` to convert path `"/api/ping"` into absolute `"http://localhost:${PORT}/api/ping"` using env `PORT` or default from tests; propagate incoming headers including `x-request-id`.
  2) Verify `tests/unit/lib.serverFetch.spec.ts` passes.
  3) For UI auth display, ensure `getCurrentUser`/`getCurrentUserInRoute` in `apps/web/src/lib/supabaseServer.ts` properly reads `x-test-auth` from cookies/headers in test-mode to produce `s@example.com` for `student` etc.
  4) Run: `npm run test:ui -- tests/unit/ui/StudentProfile.spec.tsx`; confirm expectations.
  5) Avoid touching runtime routes or messaging; keep changes to `serverFetch` and, if strictly necessary, `supabaseServer` test-mode behavior.

---

### Notes
- Start with your area’s focused specs to get fast feedback, then run the full suite.
- Keep changes isolated to your scope to avoid conflicts. If a shared file edit is unavoidable, coordinate before merging.


