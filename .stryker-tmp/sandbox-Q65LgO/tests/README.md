# tests

Guides and conventions for unit and end-to-end tests.

## Structure

- Unit tests: `tests/unit/*.spec.ts`
- E2E tests: `tests/e2e/specs/*.spec.ts`

## Running

```bash
npm --workspace tests run test       # Jest unit tests
npm --workspace tests run test:e2e   # Playwright e2e tests
npm --workspace tests run smoke-test # E2E smoke tag only
npm --workspace tests run test:coverage # Coverage report (text + html)
npm --workspace tests run test:critical # Focus critical services and APIs
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


