# Testing conventions

- Use alias-only imports in source (e.g., `@/lib/rateLimit`).
- When mocking a module used by both relative and alias paths, use `mockDual()` so both ids map to the same mock.
- Prefer helpers:
  - `mockRateLimit()` and `expectRateLimited()`
  - `makeRequest()` and `asRole()`
  - `expectJson()`, `expectHeader()`, `expectStatus()`
- Test-mode auth:
  - Set role via `x-test-auth` header, or use helpers that populate `__TEST_HEADERS_STORE__` for route handlers.
- Keep tests contract-focused: assert status, headers, response DTOs; leave implementation details to port/service tests.
