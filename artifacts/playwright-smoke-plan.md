Playwright Smoke Plan (Docs Only)

Goals
- Validate critical headers (security, request-id), CORS preflights, health, and a single runtime write.

Scenarios
1) GET /api/health → 200, check X-Frame-Options, CSP present
2) OPTIONS /api/runtime/progress (allowed origin) → 204, allow-origin present
3) POST /api/runtime/auth/exchange (mock token if possible) → 200
4) POST /api/runtime/progress with runtimeToken (scoped) → 201
5) POST /api/runtime/outcomes with provider JWT (mock clock/jwks to avoid real net) → 201

Notes
- Use environment variables for stage base and provider origin.
- Skip full E2E auth; rely on runtime tokens or mocks.



