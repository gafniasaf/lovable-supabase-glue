### Testing

This repo includes Jest unit tests, React Testing Library UI tests, Storybook interaction tests, and Playwright e2e tests under the `tests` workspace (Cypress optional).

#### Commands

```bash
npm test            # Jest unit tests (tests/unit)
npm run test:e2e    # Playwright e2e tests (tests/e2e)
npm run smoke-test  # Playwright subset tagged @smoke
npm run test:ui     # JSDOM + RTL tests (tests/jest.ui.config.cjs)
npm run test:cypress # Cypress e2e (boots web on :3030 in TEST_MODE)
npm run test:mutation # Stryker mutation tests (tests/stryker.conf.json)
```

#### Test-mode

To ensure fast, deterministic tests without external dependencies:

- Set `TEST_MODE=1` (already set by `apps/web` dev:e2e and used by tests)
- Set `DEV_ID` to namespace users/data in dev and e2e runs (e.g., `alice`, `bob`).
- Server and API routes honor a special cookie/header `x-test-auth` with values `teacher|student|parent|admin`
- When present, the system synthesizes a user and role for SSR and APIs
- Writes go to an in-memory store (`testStore`) instead of the database
- Global setup waits for `/api/health` and resets the store via `/api/__test__/reset` (fallback `/api/test/reset`) to ensure isolation; pass `?namespace=${DEV_ID}` when present

Scenarios & seeds:
- `/api/test/seed?hard=1` now accepts GET (and POST) for convenience. It seeds teacher/student/parent profiles, courses, lessons, enrollments, assignments, a submission, and sample notifications. Re-run any time; it is idempotent.
- Extendable by querystring in future (e.g., `grading=5`, `notifications=10`).

Production guard:
- In production, `TEST_MODE` must be unset and requests with `x-test-auth` are rejected.

#### Mutation testing (Stryker)

- Config: `tests/stryker.conf.json`
- Local run: `npm run test:mutation`
- CI: `.github/workflows/ci.yml` runs unit → build → Playwright E2E → Stryker on push/PR
- Scope: focuses on `apps/web/src/server/services/*` and API routes; expand gradually to keep runtime manageable

Security tests (additions):
- Assert CSRF origin checks on non-GET routes.
- Assert optional double-submit CSRF token enforcement when `CSRF_DOUBLE_SUBMIT=1` (cookie `csrf_token` matches header `x-csrf-token`).
- Assert rate limits on write-heavy endpoints.
- Assert RLS denies unauthorized DB writes/reads for assignments/submissions.

Examples:

Playwright:

```ts
// inside a test
const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/' }]);
const res = await page.request.post('/api/courses', { data: { title: 'T', description: '' }, headers: { 'x-test-auth': 'teacher' } });
```

Seeding:

```bash
curl -X POST "$PLAYWRIGHT_BASE_URL/api/test/seed?namespace=$DEV_ID"
```

Cypress:

```ts
// inside a spec
cy.loginAs('teacher'); // sets cookie x-test-auth=teacher
cy.request({ method: 'POST', url: '/api/courses', body: { title: 'T', description: '' }, headers: { 'x-test-auth': 'teacher' } })
  .its('status').should('be.oneOf', [200,201]);
```

Playwright configuration sets a default header for role via `extraHTTPHeaders` and supports overriding with `PW_TEST_AUTH`:

```ts
// tests/e2e/playwright.config.ts
use: {
  extraHTTPHeaders: {
    'x-test-auth': process.env.PW_TEST_AUTH || ''
  }
}
```

#### Jest unit tests

- Focus on services (`apps/web/src/server/services/*`) and utilities (e.g., `apiHandler`)
- Use `process.env.TEST_MODE = '1'` in `beforeEach` where relevant
- Validate sorting, list inserts, and error paths
- Interactive runtime: unit-test postMessage event handling adapters and `/api/runtime/outcomes` webhook parsing; ensure `interactive_attempts` RLS visibility in service-layer reads.

#### Playwright e2e tests

- `tests/e2e/playwright.config.ts` configures base URL and projects
- `global-setup.ts` waits for `/api/health`
- Specs simulate user workflows (login redirect, teacher dashboard, course/lesson creation)
- Coverage now includes: seeding/roles, teacher course/lesson flow, assignments and grading, profile + notifications, quizzes (build/attempt/submit), announcements + modules (with event producers), messaging (test-mode), reports (JSON/CSV + activity/retention), runtime v2 gating and OPTIONS preflights, and file uploads/downloads (ownership checks, test-mode direct upload).

Accessibility:

- `@axe-core/playwright` is integrated. New specs under `tests/e2e/specs/a11y-*.spec.ts` assert zero violations on:
  - settings, notifications inbox, notifications dropdown + mark-all flow
  - teacher analytics, student assignment detail, grading queue + submissions
  - follow the pattern:
    ```ts
    import AxeBuilder from '@axe-core/playwright';
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
    ```

Storybook interaction tests:
- Storybook is configured in `apps/web` with `@storybook/test-runner`.
- Add `play` functions to stories to click and assert changes. Run `npm --workspace apps/web run storybook:test`.
MSW is optional; for unit UI specs, prefer local fetch stubs to keep tests fast and deterministic.

New route coverage:
- `GET /api/teacher/grading-queue` has unit tests for unauthenticated/forbidden and query parsing. In tests, Supabase is mocked via a chainable helper that supports `.select().is().range().eq()`.
- In Playwright E2E, this route short-circuits in test mode to return deterministic rows with `x-total-count`, enabling stable pagination checks.

#### E2E JSON reporting (Docker)

- Generate Playwright JSON and copy artifacts:
  - `docker compose up -d web`
  - `docker compose run --rm --profile tests tests bash -lc "bash tests/e2e/run-json.sh"`
  - `docker compose down`
- Output locations:
  - `reports/e2e/summary.json`
  - `reports/e2e/test-results/` (screens, videos, traces)
- Re-run a subset by title:
  - `docker compose --profile tests run --rm tests bash -lc "node tests/e2e/wait-for-health.js && PW_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://web:3022 npm --workspace tests run test:e2e -- -c ./e2e/playwright.config.ts --project=folio-chromium -g 'Student quiz history' --reporter=json > /workspace/reports/e2e/summary.json || true"`


