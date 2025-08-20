# tests

Guides and conventions for unit and end-to-end tests.

## Structure

- Unit tests: `tests/unit/*.spec.ts`
- UI tests (RTL): `tests/unit/ui/*.spec.tsx` (use `/** @jest-environment jsdom */`)
- E2E tests: `tests/e2e/specs/*.spec.ts`

## Running

```bash
npm --workspace tests run test       # Jest unit tests
npm --workspace tests run test:e2e   # Playwright e2e tests
npm --workspace tests run smoke-test # E2E smoke tag only
npm --workspace tests run test:coverage # Coverage report (text + html)
npm --workspace tests run test:critical # Focus critical services and APIs
npm --workspace tests run test:cypress # Cypress e2e (starts app on :3030 automatically)
npm --workspace tests run cy:open      # Open Cypress UI (starts app on :3030)
```

## Test mode

- The app supports a lightweight in-memory store under `TEST_MODE=1`.
- Headers/cookies:
  - `x-test-auth`: one of `teacher|student|parent|admin` to simulate roles
- Helpers:
  - `apps/web/src/lib/testMode.ts`, `apps/web/src/lib/testStore.ts`

## Patterns

- Prefer importing contracts from `@education/shared`.
- Use `createApiHandler` for route handler tests to simplify validation and error checks.
- Use `withRouteTiming` to ensure `x-request-id` is present in responses when needed for assertions.

## Coverage goals

- Critical: `apps/web/src/server/services/**` — 95–100% lines/branches
- APIs: `apps/web/src/app/api/**` — ≥90% via contract + negative tests
- Domain services: 85–95% with edge/error paths
- UI crit-path: 85–95% component tests + E2E happy paths
- Glue/generated: 50–70% or exclude

Consider mutation testing (e.g., Stryker) for critical services/APIs.

### RTL setup

- UI specs import `tests/unit/ui/setupTests` for `@testing-library/jest-dom` and small JSDOM polyfills.
- Prefer deterministic fetch stubs over MSW for unit UI specs; see examples in `tests/unit/ui/*.spec.tsx`.
- Mock routing with `next-router-mock` when page-level flows involve navigation.

### Supabase mocks for route tests

- Use `tests/unit/helpers/supabaseMock.ts` to build chainable mocks that support `.select().is().range().eq()`.
- Example: `tests/unit/api.teacher.grading-queue.spec.ts` replaces `getRouteHandlerSupabase` with a mock returning empty data but exercising query construction.

### E2E smoke tests

- `tests/e2e/specs/smoke-dead-clicks.spec.ts` contains minimal click/URL/DOM assertions to catch dead buttons.
- Prefer assertions that indicate real work: URL changes, network requests (via route/body), DOM deltas, toasts, badge counts.

### Storybook interaction tests

- `apps/web` integrates `@storybook/test-runner`. Start Storybook locally and run:
  - `npm --workspace apps/web run storybook:test`
- Include small `play` functions in stories to click and assert visible changes.

### Accessibility lint

- `eslint-plugin-jsx-a11y` is enabled for `apps/web`. Fix issues where flagged; this prevents non-interactive elements masquerading as interactive.


