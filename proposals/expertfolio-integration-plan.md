# ExpertFolio Integration Plan (Domain Pack)

## Terminology Map (align to existing patterns)
- Education `courses` → ExpertFolio `programs`
- `assignments` → `assessments`
- `submissions` → `evaluations`
- `grades` → `competency_levels`
- New: `epa`, `sub_epa`, `program_epa_map`

## Routing & Branding
- Prefer host-based: `edu.<domain>` (Education), `folio.<domain>` (ExpertFolio). Fallback prefix-based: `/edu/*`, `/folio/*`.
- Theming/nav: add per-tenant JSON configs `config/education.json`, `config/expertfolio.json` consumed by shared layout logic.

## Migrations Outline (tables, FKs, indexes)
- Common columns on all new tables: `id uuid pk`, `tenant_id uuid not null`, `product text not null check in ('edu','folio')`, `created_at`, `updated_at`.
- Tables:
  - `programs` (owner, title, description)
  - `epa` (code, title, description)
  - `sub_epa` (epa_id fk, code, title)
  - `program_epa_map` (program_id fk, epa_id fk, sub_epa_id fk null)
  - `assessments` (program_id, trainee_id, supervisor_id, epa_id, sub_epa_id, scheduled_at)
  - `evaluations` (assessment_id, evaluator_id, rating, notes, attachments)
  - `competency_levels` (program_id, trainee_id, epa_id, level, observed_at)
- Indexes: composite `(tenant_id, product)`, plus lookup indexes e.g. `(program_id)`, `(trainee_id)`, `(epa_id, sub_epa_id)`.
- Up/down: additive creates; down drops in reverse order; keep namespacing consistent with existing migrations.

## RLS & Tenancy
- Deny-by-default on all new tables: `ENABLE ROW LEVEL SECURITY` and no implicit `SELECT`.
- Policies:
  - Trainees: `SELECT` own evaluations, program progress.
  - Supervisors: `SELECT` for supervised programs; `INSERT` evaluations they submit.
  - Admins: tenant-scoped full access via app-layer guarded routes.
- All queries must filter by `tenant_id` and `product` in services.
- Add negative tests mirroring `tests/unit/db.rls.*.negative.spec.ts`.

## DTOs & Response Validation
- Follow existing naming: `programDto`, `epaDto`, `assessmentDto`, `evaluationDto`, `competencyLevelDto`, and corresponding list DTOs.
- Request schemas: `assessmentCreateRequest`, `evaluationCreateRequest`, etc.
- All 2xx JSON must use `jsonDto` with the shared Zod schemas via `@education/shared`.

## API Route Conventions
- Use `withRouteTiming(createApiHandler({ schema, handler }))` for all mutating routes; GETs at minimum use `withRouteTiming`.
- Error envelope: `{ error: { code, message }, requestId }` exactly as in `docs/api.md`.
- CSRF, rate limits, DTO parsing via existing helpers.

## Read Models & Dashboards
- Trainee EPA progress: aggregated counts and latest competency per EPA.
- Supervisor review queue: pending evaluations per supervisor across programs.
- Program overview: enrollment totals, EPA coverage, recent activity.
- Implement via server services analogous to `server/services/dashboard.ts`, validated by DTOs.

## Files & PHI
- Storage keying: `devPrefix/folio/{program|evaluation}/{id}/...` with bucket from `NEXT_PUBLIC_UPLOAD_BUCKET`.
- Allowed MIME via `getAllowedUploadMime()`; sanitize filenames consistently.
- PHI: mark sensitive fields (`evaluations.notes`) and ensure log redaction through existing logger helpers.

## Notifications
- Reuse in-app notifications: triggers on `evaluation.submit` and `evaluation.review` events.

## Tests to Add
- Jest: DTO schemas, services, API handlers, and RLS negatives.
- Playwright: split by host or testDir — `edu` and `folio` with distinct `baseURL` and storageState. Reuse `x-test-auth`.

## Acceptance Criteria (per task)
- Uses `withRouteTiming` and `createApiHandler` as applicable.
- All 2xx responses validated by `jsonDto`; errors follow envelope; `x-request-id` echoed.
- RLS enforced with deny-by-default; negative tests included.
- Tenancy: every row has `tenant_id` + `product`; queries filter by both.
- Docker: builds and runs via compose; no new infra patterns.
- Docs updated (API, ADR links), artifacts and reports generated.

## Schedule Options
- 10-day path: core tables, assessments/evaluations CRUD, minimal dashboards, unit + initial e2e.
- 15-day path: add competency projections, supervisor queue polish, notifications, coverage targets.

## Definition of Done
- TDD sequence: component/contract → code → unit → e2e, all green.
- Docker-only workflows: build/run/test via compose profiles.
- RLS + tenancy verified with negative tests.
- DTO validation enforced on all 2xx.
- Security headers present; request-id propagation verified.
- Logs/metrics present with route labels; docs updated.


