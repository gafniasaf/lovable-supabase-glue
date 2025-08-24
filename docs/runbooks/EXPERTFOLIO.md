# ExpertFolio Runbook

## Enablement
## Tenancy & Product Resolution
- Resolver: `apps/web/src/lib/tenant.ts`
  - `resolveTenantFromHostOrPrefix(req)` returns `{ tenantId, product }`
  - Host mapping: `folio.*` → `product='expertfolio'`, else `education`
  - Tenant defaults can be overridden via `DEFAULT_EDU_TENANT_ID`, `DEFAULT_FOLIO_TENANT_ID`
- Services use the resolver and set `{ tenant_id, product }` on inserts and filter reads by both.
- Set `FEATURES_EXPERTFOLIO=1` for the web service.
- In Docker Compose (override):
  - `TEST_MODE=1`
  - `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key-1234567890`

## Endpoints (Part 1 skeleton)
- `POST /api/ef/assessments` — create assessment (TEST_MODE uses in-memory adapter)
- `POST /api/ef/evaluations` — create evaluation (TEST_MODE uses in-memory adapter)
- Diagnostics (TEST_MODE only):
  - `GET /api/ef/diag` — returns `{ ef: boolean, testMode: boolean }`
  - `POST /api/ef/diag` — exercises in-memory assessment path
  - `GET /api/diag/errors` — recent server logs (requires header `x-admin-diag: 1`)
    - Filters: `level=error|warn|info|debug|all`, `levels=a,b`, `sinceMs=60000`, `traceId=<request-id>`, `offset`, `n`, `stack=1`
    - CSV export: `format=csv`
  - `POST /api/diag/errors?clear=1` — clear in-memory ring buffer (requires header `x-admin-diag: 1`)

Headers for tests:
- `x-test-auth: teacher`
- For mutations: include `origin` and `referer` matching `NEXT_PUBLIC_BASE_URL`

## E2E
- Config has two projects: `edu-chromium` and `folio-chromium`.
- Run folio smoke against a running container:
  - Start: `docker compose up -d web`
  - Script (PowerShell): `tests/e2e/run-folio.ps1`

## CI
- GitHub Actions:
  - `.github/workflows/ci.yml`: builds container, runs unit + E2E (tests profile), uploads `reports/` and `artifacts/`.
  - `.github/workflows/synthetic-ef-smoke.yml`: nightly EF smoke (POST assessment/evaluation) against TEST_MODE container.

## Files & PHI
- Storage key: `<tenant_id>/<product>/<entity>/<id>/<filename>` via `apps/web/src/lib/storageKey.ts`
- Endpoints:
  - `POST /api/ef/files/upload-url` { entity, id, filename, contentType } → { url, method:'PUT', headers }
    - Enforces MIME allow-list (`getAllowedUploadMime()`)
  - `POST /api/ef/files/download-url` { entity, id, filename } → { url }
- PHI: ensure logs redact sensitive payloads; do not log full object keys or raw headers.

## Idempotency & Rate Limits
- Idempotency (assessments):
  - Header: `Idempotency-Key`
  - Table: `idempotency_keys` (RLS-enabled)
  - Behavior: same key returns stored 201 response; single insert
- Rate limits (EF create):
  - Per-user: `EF_CREATE_RATE_LIMIT` per `EF_CREATE_RATE_WINDOW_MS` (ms)
  - 429 with `retry-after` header on exceed

## Observability & Alerts
- Metrics endpoint: `GET /api/internal/metrics` (Prometheus text; require `x-metrics-token`)
- Counters: `ef.assessment.create.*`, `ef.evaluation.create.*`; route timings/errors emitted globally
- Alert guidance:
  - EF POST 5xx above threshold
  - p95 latency regression on EF routes
  - Notification enqueue failures increase

## Pre-flight & Canary
- Pre-flight checklist (staging):
  - Health 200; security headers intact (CSP nonce, HSTS in prod, Referrer-Policy)
  - EF POSTs 2xx on DB path (DTO-validated)
  - Read-model endpoints respond < 1s; counts match
  - Upload/download signed URLs work
  - Playwright edu + folio suites pass; reports archived under `/reports`
- Canary rollout:
  - Enable `FEATURES_EXPERTFOLIO=1` for pilot tenant
  - Watch p95, 5xx, login success, notifications throughput
  - Ramp 25% → 100% or rollback via flag

## Prod Safety
- TEST_MODE: disabled by default in prod; diag endpoints return 404 when TEST_MODE=0
- CSRF bypass for EF routes only when TEST_MODE=1; otherwise enforced

## Migrations & RLS (Day A)
- Tables: `programs, epa, sub_epa, program_epa_map, assessments, evaluations, competency_levels`
- Columns: include `tenant_id`, `product`
- RLS: enabled, deny-by-default
- Seeds: `0053_expertfolio_seeds.sql`

## Notifications
- On assessment submit: `ef.assessment.submitted`
- On evaluation created: `ef.evaluation.created`
- List via `GET /api/notifications`

## Troubleshooting
- 404 on EF routes: ensure `FEATURES_EXPERTFOLIO=1` is present in the container env.
- 403 on CSRF in TEST_MODE: EF routes bypass CSRF in TEST_MODE.
- 500 responses during TEST_MODE:
  - Check container logs: `docker compose logs web`
  - EF handlers emit JSON error messages in TEST_MODE; if a Next.js 500 page appears, probe `/api/ef/diag` first.
  - Use `GET /api/diag/errors?n=50&levels=all&sinceMs=300000` with `x-admin-diag: 1` to inspect recent errors with `requestId` and `path`.
- Playwright health timeout: when using container, set `PW_NO_SERVER=1` and `PLAYWRIGHT_BASE_URL` to `http://localhost:3022`.


