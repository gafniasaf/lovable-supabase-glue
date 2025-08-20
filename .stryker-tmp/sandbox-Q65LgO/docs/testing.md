### Testing

This repo includes Jest unit tests, Playwright e2e tests, and Cypress e2e tests under the `tests` workspace.

#### Commands

```bash
npm test            # Jest unit tests (tests/unit)
npm run test:e2e    # Playwright e2e tests (tests/e2e)
npm run smoke-test  # Playwright subset tagged @smoke
npm run test:cypress # Cypress e2e (boots web on :3030 in TEST_MODE)
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
- Coverage now includes: seeding/roles, teacher course/lesson flow, assignments and grading, profile + notifications, quizzes (build/attempt/submit), announcements + modules, messaging (test-mode), reports (JSON/CSV), and file uploads/downloads (test-mode direct upload).

Accessibility:

- `@axe-core/playwright` is integrated. New specs under `tests/e2e/specs/a11y-*.spec.ts` assert zero violations on:
  - dashboard (teacher/student), course admin, assignment submissions view, quiz runner, and student profile
  - add more pages by following the pattern:
    ```ts
    import AxeBuilder from '@axe-core/playwright';
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    ```

#### External Courses — Conformance (plan)

- Runtime v2 harness:
  - `auth.exchange`, `context.get`, `progress.upsert`, `grade.submit`
  - `events` with scopes and rate limits
  - `checkpoint.save/load` (size limits, upsert semantics)
  - `asset.sign-url` (content-type allowlist, CORS)
- Mutation testing (later): add Stryker on runtime/registry handlers with thresholds in CI


