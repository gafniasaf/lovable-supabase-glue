# ExpertFolio Integration Summary

## Endpoints
- Create:
  - `POST /api/ef/assessments` (Idempotency-Key supported; per-user rate limit)
  - `POST /api/ef/evaluations`
- Read:
  - `POST /api/ef/read/trainee` → trainee progress
  - `POST /api/ef/read/supervisor` → supervisor queue
  - `POST /api/ef/read/program` → program overview
- Files:
  - `POST /api/ef/files/upload-url` (MIME allowlist)
  - `POST /api/ef/files/download-url`
- Diagnostics (TEST_MODE only):
  - `GET/POST /api/ef/diag`
  - `GET/POST /api/diag/errors` (admin header, filters; 404 in prod)
- Metrics:
  - `GET /api/internal/metrics` (Prometheus text; `x-metrics-token`)

## Tenancy & Product
- `resolveTenantFromHostOrPrefix(req)` resolves `{ tenantId, product }`; services insert and filter by both.

## Idempotency & Rate Limits
- Assessments: Idempotency via `idempotency_keys` table; same key returns stored 201.
- Per-user rate limit: `EF_CREATE_RATE_LIMIT` per `EF_CREATE_RATE_WINDOW_MS`.

## Tests
- Unit slices: DTOs, routes (create/read/files), services, resolver, idempotency/rate.
- Playwright: Folio EF flow (`tests/e2e/specs/folio/ef-flow.spec.ts`).

## Docker commands
```bash
docker compose build web
docker compose up -d web
```

## Quick probes
```bash
curl -si $BASE/api/health
curl -s -X POST $BASE/api/ef/assessments \
  -H 'content-type: application/json' -H 'x-test-auth: teacher' \
  -H "origin: $BASE" -H "referer: $BASE/x" \
  -d '{"programId":"11111111-1111-1111-1111-111111111111","epaId":"22222222-2222-2222-2222-222222222222"}'
```

## Artifacts & Reports
- Artifacts:
  - `artifacts/ef-sanity-health.txt`
  - `artifacts/ef-sanity-post.json`
  - `artifacts/ef-sanity-upload-url.json`
  - `artifacts/ef-sanity-metrics.txt`
- Reports:
  - Unit/E2E: `reports/` (JUnit, Playwright test-results)

## CI
- `.github/workflows/ci.yml`: build + tests + upload reports/artifacts.
- `.github/workflows/synthetic-ef-smoke.yml`: nightly EF smoke.


