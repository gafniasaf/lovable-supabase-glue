### Modified Build Approach — Contracts‑first, Secure‑by‑default, Testable‑by‑design

This document standardizes how we build projects of this type so teams can repeat the same results quickly and safely.

## Goals
- **Repeatable**: Same structure, commands, and quality bars across projects.
- **Parallel velocity**: Frontend, backend, and QA can move independently.
- **Safety**: Strong validation, security, and observability from day one.

## Non‑goals
- Replacing domain docs (see `docs/architecture.md`, `docs/api.md`, `docs/data-model.md`).
- Exhaustive onboarding; this is a tactical approach guide.

## Technical stack (pinned examples)
- **Runtime/UI**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Contracts/Validation**: Zod (`packages/shared`) as single source of truth
- **Auth/DB**: Supabase (auth helpers + Postgres with RLS)
- **Security**: jose (JWT), CSRF guards, rate limiting, hardened headers
- **Logging/Obs**: Pino, request IDs, per‑route timings and counters
- **Testing**: Jest (unit + JSDOM UI), Playwright (E2E + a11y), Stryker (mutation)
- **Storybook**: Interaction tests via `@storybook/test-runner`
- **Docker**: Multi‑stage Next.js build; Compose for app + Playwright runner

## Phased delivery (build to deployable green at each step)
- **MVP (ADR 0001)**: Role dashboards, minimal lessons/progress, basic observability, deploy.
- **Hardening (M0.5–M0.7)**: RLS, CSRF origin + optional double‑submit, per‑feature rate limits, env validation, response DTOs, mutation tests.
- **M1–M3**: Content, assignments/submissions, quizzes.
- **M3.5**: Interactive Runtime (WebEmbed + JWT + outcomes/events).
- **M4+**: External Course Registry phases, Bundles/Validator, Observability quotas, Governance.
- Extraction only when gates trip (see below).

## Architecture (layers and seams)
- UI (server components) → **Gateways** (`apps/web/src/lib/data/*`) → API Route Handlers → Services (`apps/web/src/server/services/*`) → DB (Supabase/RLS)
- **Shared contracts** and env validation live in `packages/shared` (consumed by both app and tests).
- SSR correctness is preserved by having UI call Gateways that talk to HTTP routes.

## Contracts‑first development
- Author Zod schemas in `packages/shared/src/schemas/**` for entities, requests, and response DTOs.
- Enforce `.strict()` on write paths; tolerate additive reads via versioned DTOs when needed.
- Parse request bodies and responses against Zod at the app boundary.
- Standardize error envelope: `{ error: { code, message }, requestId }`.
- Prefer 400 for validation in MVP; allow 422 once clients are ready.
- Recommended: generate OpenAPI from Zod and publish typed clients for future service extraction.

## API discipline
- Use `createApiHandler({ schema, preAuth, handler })` to:
  - Validate JSON with Zod, echo `x-request-id`, return Problem envelope
  - Enforce CSRF Origin/Referer on non‑GET + optional double‑submit token
  - Apply global/per‑feature rate limits and emit metrics
- Validate queries via `parseQuery(req, schema)`.

## Frontend Gateways + Test Mode
- Per‑domain gateway exposes `createHttpGateway`, `createTestGateway`, and `create<Domain>Gateway()` that switches by `isTestMode()`.
- Gateways own response parsing with Zod and normalize shape differences.
- **Test Mode** (`TEST_MODE=1`, role via `x-test-auth`) uses in‑memory store and idempotent seeds (`/api/test/seed?hard=1`).
- Result: FE and QA remain unblocked while BE evolves.

## Security posture (default‑on)
- RLS for all tables; negative tests for unauthorized reads/writes.
- CSRF: Origin/Referer checks on non‑GET; optional double‑submit (`csrf_token` + `x-csrf-token`).
- Rate limits: global per‑IP and per‑endpoint knobs.
- JWT: RS256 in production for runtime tokens; origin‑bound audience; one‑time nonce where applicable.
- Headers: CSP (nonce + dynamic frame‑src for embeds), HSTS, Referrer‑Policy, Permissions‑Policy, COOP/CORP.
- Guardrails: reject `x-test-auth` when not in test mode.

## Observability & SLOs
- Request IDs from middleware; structured logs with `route_success|route_error`, `ms`, and `requestId`.
- Per‑route timings (p50/p95/p99), error counts, and in‑flight saturation; expose `/api/admin/metrics` and internal gated metrics.
- Initial SLOs: dashboards p95 < 800ms; health p95 < 200ms; error rate < 0.5%.
- CI budget checks: fail pipeline when p95 exceeds budgets or errors > 0.

## Testing strategy (TDD pipeline)
- Component/Unit (Jest):
  - Focus on services and handler helpers; coverage gates ≥95% services, ≥90% routes.
  - JSDOM UI tests for critical components and interaction states.
- E2E (Playwright):
  - Health‑gated startup; role via `x-test-auth` header; traces/videos on failure; a11y checks with zero critical violations.
  - Smoke on PRs; full suites on main/nightly; flake detection enabled.
- Mutation (Stryker):
  - Apply to core services and happy‑path guards to harden logic.
- Contract tests (recommended):
  - Validate route responses against shared DTOs; run separate from UI/E2E to catch schema drift early.
- Artifacts: store results under `reports/` and `artifacts/` for triage.

## Docker & Compose
- Multi‑stage Dockerfile builds Next.js standalone and runs as non‑root.
- `docker-compose.yml` provides:
  - `web`: app on port 3022 with healthcheck to `/api/health` (TEST_MODE by default for local dev)
  - `tests`: Playwright container that depends on healthy `web`, copies results to `reports/` and `artifacts/`
- Common pitfall: port conflicts; either kill the process or bump `WEB_PORT`/`PORT`.

## Service extraction gates (defer by default)
Extract a domain into a service only when ≥2 are true:
- Deploy contention between independent workstreams
- Divergent scaling or latency profiles
- Incident blast‑radius concerns
- Background jobs violate web latency budgets
- Clear data ownership/security isolation gains

## Parallel work model (roles)
- **Coder A (Frontend)**: UI, Gateways, TestGateway, Storybook. Avoid routes/services/schemas.
- **Coder B (Backend)**: Schemas/DTOs, API routes, services, migrations, rate limits/security.
- **Coder C (QA)**: Jest/Playwright suites, a11y, artifacts, CI checks.
- Boundaries, ownership, and cadence are outlined in `docs/parallel-work.md`.

## Checklists

### New domain
- [ ] Define Zod schemas (entity, request, response DTOs) in `packages/shared`
- [ ] Add service interface + tests; wire API handlers via `createApiHandler`
- [ ] Implement Gateways (HTTP + Test) and integrate pages/components
- [ ] Add unit + E2E + a11y + mutation tests; ensure coverage gates
- [ ] Document API (`docs/api.md`) and UI (`docs/ui-ux.md`)

### Breaking contract change
- [ ] Introduce versioned DTO (e.g., `dashboardResponseV2`) and keep V1 until FE cuts over
- [ ] Update handlers to emit both where needed; add negative tests
- [ ] Regenerate OpenAPI/clients; run contract tests

### Pre‑merge quality bar
- [ ] Unit + UI tests green with coverage thresholds
- [ ] Playwright smoke green in CI; full suite for larger PRs
- [ ] Security headers present; CSRF/rate‑limit negative tests pass
- [ ] Metrics budgets within SLO; zero critical a11y violations

### Release
- [ ] Env validation passes (fail‑fast on missing/invalid secrets)
- [ ] `TEST_MODE` unset in prod; `x-test-auth` hard‑rejected
- [ ] Post‑deploy smoke: `/api/health`, dashboards load, security headers visible, request IDs echoed

## Commands (Windows‑friendly examples)
- Dev (TEST_MODE): `set WEB_PORT=3022&& npm --workspace apps/web run dev:test`
- Smoke locally: `npm run smoke-test`
- Full E2E: `npm run e2e`
- Build → start: `npm --workspace apps/web run build && set PORT=3022&& npm --workspace apps/web run start`

## References
- `docs/architecture.md`, `docs/roadmap.md`, `docs/testing.md`, `docs/observability.md`, `docs/parallel-work.md`, `docs/DEPLOYMENT.md`
- Gateways pattern: `apps/web/src/README-GATEWAYS.md`
- Handler helpers: `apps/web/src/server/apiHandler.ts`, `apps/web/src/server/withRouteTiming.ts`
- Query parsing: `apps/web/src/lib/zodQuery.ts`
- Contracts: `packages/shared/src/schemas/**`


