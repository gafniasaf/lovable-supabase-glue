# System Scan Report

## Repository Structure
- Apps: `apps/web` (Next.js 14, React 18, TypeScript)
- Packages: `packages/shared` (shared DTOs/Zod schemas via `@education/shared` and `@shared`)
- Database: `supabase/migrations` (SQL migrations with extensive RLS)
- Tests: `tests` (unit via Jest, e2e via Playwright), `reports` (coverage/logs), `artifacts` (snapshots)
- Docker: `apps/web/Dockerfile`, `docker-compose.yml`

## TypeScript & Next.js Conventions
- Path aliases in `apps/web/tsconfig.json`: `@/*` to `apps/web/src/*`, and shared packages via `@education/shared`.
- Route handlers are wrapped with `withRouteTiming` and often `createApiHandler` for CSRF/rate-limit and consistent request-id handling.
- Middleware `apps/web/middleware.ts` injects `x-request-id`, computes CSP with nonce, sets security headers, and rejects test headers in prod.

## DTOs + Zod Pattern
- Response DTO validation helper: `apps/web/src/lib/jsonDto.ts` validates all 2xx JSON and echoes `x-request-id`.
- Common error envelope shape: `{ error: { code, message }, requestId }` per `docs/api.md`.
- DTOs live in `packages/shared/src/**` and are re-exported via `@education/shared` (e.g., `dashboardDto`, `assignmentDto`).

## Auth & RLS Summary
- Server auth: `apps/web/src/lib/supabaseServer.ts` derives current user; in TEST_MODE or Playwright, `x-test-auth` synthesizes roles.
- Roles: `docs/roles.md` details student/teacher/parent/admin usage; enforced at API layer and DB RLS.
- RLS: migrations widely `ENABLE ROW LEVEL SECURITY` and define granular `CREATE POLICY` for tables like `assignments`, `submissions`, `messages`, `notifications`, `progress`, runtime tables.
- Tenancy columns: sparse. Only explicit `tenant_id` mention found in `0050_licenses.sql`.

Artifacts: `artifacts/scan/rls-policies.txt`, `artifacts/scan/tenancy-columns.txt`

## Database & Migrations Conventions
- Files in `supabase/migrations` numbered sequentially; use `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` then `CREATE POLICY ...` blocks.
- Indexes and constraints grouped in combined migration files (e.g., `0035_*`), RLS tightened in follow-ups.

## Files/Storage Handling
- Upload presign and validation in `apps/web/src/app/api/files/upload-url/route.ts` using `getAllowedUploadMime()` and size checks; object keys prefixed by DEV id for non-prod; bucket via `NEXT_PUBLIC_UPLOAD_BUCKET`.
- Download presign in `apps/web/src/app/api/files/download-url/route.ts`; helper signatures in `apps/web/src/lib/files.ts`.
- PHI redaction: logs use centralized logger with redaction hooks; response validation only returns schema-safe data.

## Dashboards & Read Models
- Dashboard aggregation via service `apps/web/src/server/services/dashboard.ts` and validated by `dashboardDto`.
- Metrics and saturation collected per-path in `apps/web/src/lib/metrics.ts`; route wrapper records timings and errors.

## Tests & CI Overview
- Jest config: `tests/jest.config.cjs` with shims for `next`, `pino`, `jose`, and path mapping to app and shared.
- Playwright config: `tests/e2e/playwright.config.ts` with optional webServer runner and `x-test-auth` header injection; Cypress present but not primary.
- Inventory captured: `artifacts/scan/jest-tests.txt`, config paths in `artifacts/scan/playwright-config.txt`.

## Observability & Security Headers
- Request-ID: generated/propagated by middleware and wrappers; echoed on all responses.
- Security headers: CSP with nonce, HSTS (prod), Referrer-Policy, COOP/CORP present. Verified via `/api/health`.

Artifacts: `artifacts/scan/health-headers.txt`, `artifacts/scan/health-body.json`

## Docker & Compose Notes
- Multi-stage Dockerfile builds Next.js standalone (`apps/web/Dockerfile`).
- Compose exposes web on port 3022; uses image `education-platform-web:local`.
- Compose hygiene: `container_name` present for `web` and `tests` (diverges from requested hygiene), ports are static (`3022:3022`), profiles defined for `tests` only.

Artifacts: `artifacts/scan/docker-build-web.log`, `artifacts/scan/docker-up-web.log`, `artifacts/scan/compose-hygiene.txt`

## Linked Logs
- Typecheck: `artifacts/scan/npm-typecheck.log`
- Jest inventory: `artifacts/scan/jest-tests.txt`
- Playwright/Cypress config inventory: `artifacts/scan/playwright-config.txt`, `artifacts/scan/cypress-config.txt`
- Health probe: `artifacts/scan/health-response.txt`, `artifacts/scan/health-headers.txt`, `artifacts/scan/health-body.json`


