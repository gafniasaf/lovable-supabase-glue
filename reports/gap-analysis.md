# Gap Analysis — ExpertFolio Integration

## Areas Diverging from Current Patterns
- Tenancy columns: `tenant_id` and `product` are not consistently present across core tables; only `tenant_id` appears in `0050_licenses.sql`.
- Compose hygiene: `container_name` is used for `web` and `tests`; requested guideline prefers avoiding it and parameterizing ports.
- Ports: web uses fixed `3022`; guidelines request parameterized ports via env.

## Missing Tables/Indices for ExpertFolio
- New domain tables needed: `epa`, `sub_epa`, `programs`, `program_epa_map`, `assessments`, `evaluations`, `competency_levels` with `tenant_id`, `product`.
- Indices: `(tenant_id, product)` composite, FKs to users/programs, and common lookup indexes per read models.

## RLS Holes or Tenancy Absence
- Add `ENABLE ROW LEVEL SECURITY` and deny-by-default policies for all new tables.
- Ensure per-row scoping: students see own evaluations; supervisors see assigned program EPAs; admins scoped per tenant.
- Extend existing tables participating in cross-domain reads (e.g., `attachments`) with `tenant_id`, `product` if reused.

## DTO Mismatches (Request/Response)
- ExpertFolio DTOs must follow existing naming: `entityDto`, `entityListDto`, request schemas like `entityCreateRequest`, `entityUpdateRequest`.
- Response validation: must use `jsonDto` on all 2xx.

## Test Gaps
- Add Playwright project split or host-based baseURLs for `edu` and `folio`. Current config has single project.
- Jest unit coverage for new DTOs, API handlers, and RLS negative tests (mirroring existing `db.rls.*.negative.spec.ts`).

## Security/Observability Gaps
- Ensure CSP nonce applied on folio pages and APIs via existing middleware.
- Confirm request-id propagation through folio routes.
- Add PHI redaction hooks where evaluations might include sensitive notes.

## Risks, Impact, Mitigation
- Risk: Cross-domain naming drift. Impact: maintenance burden. Mitigation: strict reuse of wrappers (`withRouteTiming`, `createApiHandler`, `jsonDto`).
- Risk: RLS misconfiguration. Impact: data leak. Mitigation: deny-by-default policies; negative tests; review policies.
- Risk: Migration churn. Impact: downtime. Mitigation: additive migrations, feature flags, backfills.
- Risk: Compose hygiene divergence. Impact: ops inconsistency. Mitigation: plan follow-up to remove `container_name` and parameterize ports post-integration.


