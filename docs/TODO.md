### System hardening and feature roadmap — TODOs

Use this checklist to track the recommendations across security, reliability, observability, and product features. Grouped by priority. All items should include tests and docs updates in their PRs.

#### P0 — Security & Stability (blockers before broad rollout)
- [x] Strict RLS for `assignments` and `submissions`
  - [x] Students: insert/select own submissions; cannot update after grading
  - [x] Teachers: select/grade submissions for their courses; manage assignments for their courses
- [x] Test-mode guard
  - [x] Reject `x-test-auth` in non-test environments; log security warning
  - [x] Assert prod builds run with `TEST_MODE` unset
- [x] JWT launch tokens
  - [x] Require RS256 in production; fail fast if `NEXT_RUNTIME_PRIVATE_KEY` missing
  - [x] Remove HS256 fallback in production
- [x] Provider verification for `/api/runtime/outcomes`
  - [x] Verify JWT via provider JWKS with issuer/audience checks
  - [x] Enforce `nonce` one-time-use and expiry consistently across entry points
- [x] CSRF protections
  - [x] Enforce `Origin/Referer` checks on non-GET routes (via `withRouteTiming`)
  - [ ] Optional double-submit CSRF token for sensitive mutations
- [ ] Rate limiting
  - [x] Per-IP and per-user limits for auth-sensitive and write-heavy endpoints (events, outcomes, messaging, uploads, notifications)
  - [x] Optional global per-IP mutation limit via `GLOBAL_MUTATION_RATE_LIMIT`
- [x] Security headers
  - [x] Add CSP, HSTS, Referrer-Policy, Permissions-Policy in `next.config.mjs`
  - [x] Restrict `frame-ancestors`; tune `connect-src` for interactive providers
- [x] Request ID generation
  - [x] Switch middleware to `crypto.randomUUID()` for `x-request-id`
- [ ] Secrets/env hygiene
  - [ ] Runtime assertion: required env vars set in production (Supabase, JWT keys)

#### P1 — Core capabilities
- [x] Presigned uploads/downloads (Supabase Storage or S3)
  - [x] Content-type allowlist and size limits (test-mode size cap; allowlist enforced)
  - [x] Ownership checks on download; signed URL expirations
  - [ ] Optional AV scanning hook
- [x] Notifications persistence & delivery
  - [x] Tables + RLS; list/mark-read APIs; preferences persist; read-all endpoint
  - [x] Producers for grades posted, messages, due soon (initial producers: assignments/messages)
  - [x] Scheduled due-soon producer via lightweight job (opt-in with `DUE_SOON_JOB=1`)
- [ ] Analytics events & reports
  - [x] Event ingestion endpoint (stub in prod)
  - [x] Teacher engagement and grade distribution backed by DB + CSV export

#### P2 — Communications
- [x] Messaging MVP
  - [x] DB schema + RLS for threads/participants/messages
  - [x] Read/list/send/read-all APIs (DB-backed in prod; test-mode stubs retained)
  - [ ] Extraction path (ports/OpenAPI, service proxy behind flag)

#### P3 — Interoperability
- [ ] LTI 1.3 scaffold and xAPI mapping

#### P4 — Admin & Compliance
- [ ] Audit logs for admin actions and grading
- [ ] Data export/deletion flows
- [ ] Optional: Move `admin` to DB-level enum in `profiles.role` and update RLS as needed
  - [x] Add provider admin endpoints (list/create/update/delete) with validation

#### Observability & Ops
- [x] Metrics: per-endpoint latency (p50/p95), error rates, saturation (in-memory endpoint)
- [ ] Log redaction for PII/secrets
- [ ] Background jobs: propagate `x-request-id`; job duration metrics

#### Testing
- [ ] Security tests: CSRF origin checks, rate limits, test-mode rejection in prod
- [ ] RLS negative tests: DB denies unauthorized ops for all critical tables
- [ ] Load/smoke tests for messaging/events and interactive endpoints
- [ ] Contract tests: OpenAPI from Zod matches handlers



---

## Program — External Courses Ecosystem to 100%

End-to-end checklist to take External Courses (Registry + Runtime v2 + Governance) from current state (~31%) to 100%. Each item must include unit tests (Jest) and e2e coverage (Playwright) and update relevant docs (ADR 0002, API, Architecture, Data model, Testing, Observability).

### A. External Course Ecosystem (Registry + Assignment Linking)
- [ ] Registry CRUD completeness
  - [ ] `GET /api/registry/courses` supports search, pagination, status filters, vendor scoping
  - [ ] `POST /api/registry/courses` validates kind-specific fields (v1 requires bundle_ref, v2 requires launch_url)
  - [ ] `PATCH /api/registry/courses` with partial updates and RLS/role checks
  - [ ] `DELETE /api/registry/courses/[id]` with soft-delete and referential checks
  - [ ] `GET/POST /api/registry/versions` complete with approve/disable; enforce unique (external_course_id, version)
- [ ] Assignment linking
  - [ ] Persist `assignment_targets` on assignment create/edit; server-side validation for source=\{native|v1|v2\}
  - [ ] Add RLS for `assignment_targets` (teachers of course can read/write)
  - [ ] Ensure assignment launch derives CSP allowlist and provider origin from target
  - [ ] UI: Teacher picker supports v1 bundles list, v2 courses list with status/version badges
- [ ] Admin Catalog UI (minimal exists)
  - [ ] Search + filters (status, kind, vendor)
  - [ ] Version management (list/add/approve/disable)
  - [ ] Tenant/vendor scoping (feature flagged)
  - [ ] CSV/JSON export

Acceptance criteria:
- Teacher links assignment to an approved external entry; student launches successfully with CSP/origin enforced; progress/grades sync; registry searchable and auditable.

### B. Runtime & Integration (v2)
- [ ] Align events API with v2 runtime bearer
  - [ ] Add `/api/runtime/event` that authenticates the v2 runtime token (Bearer), enforces scopes, rate-limits by alias+course, persists to `course_events`
  - [ ] Deprecate or gate the platform-auth variant under `INTERACTIVE_RUNTIME`
- [ ] Checkpoints persistence
  - [ ] Add `runtime_checkpoints(id, course_id, alias, key, state jsonb, created_at, updated_at)` with RLS (server writes; read by alias)
  - [ ] Implement `/api/runtime/checkpoint/save` and `/api/runtime/checkpoint/load` with runtime token auth and size limits (e.g., 32KB)
  - [ ] UI: Student launch shows resume indicator when checkpoint exists
- [ ] Asset sign URL
  - [ ] Implement `/api/runtime/asset/sign-url` with runtime token auth, content-type allowlist, size caps, and scope checks
  - [ ] Delegate to existing upload/download signer; return provider-friendly response
- [ ] Progress/grade idempotency
  - [ ] Optional idempotency key support to avoid duplicate writes from flaky networks
- [ ] CORS and origin binding
  - [ ] Enforce `aud` match for runtime token across all runtime v2 endpoints
  - [ ] CORS allow per `RUNTIME_CORS_ALLOW` and dynamic provider-origin detection

Acceptance criteria:
- All runtime v2 endpoints (auth, context, progress, grade, event, checkpoint, asset) accept runtime tokens, enforce scopes/origin, and persist appropriately with rate limits.

### C. Security / Isolation / Compliance
- [ ] Rate limits per endpoint (progress, grade, event, checkpoint, asset) by alias/course/provider
- [ ] Secrets/env hygiene: runtime asserts required env vars in prod (Supabase URL/keys, JWT private/public keys)
- [ ] CSP dynamic `frame-src` from assignment target/provider; document overrides
- [ ] Optional double-submit CSRF token on sensitive non-GET mutations
- [ ] Privacy review: ensure aliases, no PII exposure to providers; document data sharing

Acceptance criteria:
- Security headers present; origin-bound tokens enforced; rate limits active; secrets validated at boot; tests cover negative cases.

### D. Authoring & Tooling (v1 bundles + SDK)
- [ ] v1 bundle manifests
  - [ ] Zod + JSON Schema for bundle manifest and lesson listing
  - [ ] CLI `bundle-validator` (CI-friendly) with helpful diagnostics
  - [ ] Import endpoints `/api/registry/bundles/{import,validate}` (idempotent on bundleId+version)
- [ ] Authoring Studio (internal)
  - [ ] Create/edit bundle metadata; reorder lessons; preview; export
- [ ] Vendor SDK (TS)
  - [ ] `init()`, `getContext()`, `saveProgress()`, `submitGrade()`, `emitEvent()`, `checkpoint.save/load()`, `signAssetUrl()`

Acceptance criteria:
- Validated bundles import and are assignable; provider SDK enables easy integration; authoring studio usable internally.

### E. Platform UI
- [ ] Admin Catalog: complete as above with vendor/tenant scoping and version management
- [ ] Teacher Assignment Picker: v1 bundles + v2 courses with search and badges
- [ ] Student Launch: resume/offline indicators using checkpoints; error/retry paths

Acceptance criteria:
- Admins manage external registry; teachers select targets efficiently; students see robust launch UX.

### F. Observability / Reliability
- [ ] Dead-letter queue (DLQ) with replay endpoints and background jobs
- [ ] Usage counters per day/provider/course (progress, grade, events, storage bytes)
- [ ] Runtime audit logs for key actions (token exchange, checkpoint save, asset sign)
- [ ] Request tracing: propagate `x-request-id` across runtime flows; structured logs

Acceptance criteria:
- Failed writes are visible and replayable; usage and error rates observable; runtime actions auditable.

### G. Test & Quality Bar
- [ ] Conformance harness for Runtime API v2 covering all endpoints and edge cases
- [ ] Mutation testing (e.g., Stryker) on runtime handlers and registry CRUD with thresholds
- [ ] Per-area coverage thresholds (runtime, registry, UI) enforced in CI
- [ ] Load tests for runtime endpoints (happy/abuse paths)

Acceptance criteria:
- Conformance suite green; mutation score threshold met; CI gates enforce quality.

### H. Governance & Distribution
- [ ] Version pinning and instant rollback for `course_versions`
- [ ] Licensing/seats model and enforcement in launch flows
- [ ] Vendor portal (uploads, logs, usage, licenses, health)
- [ ] Tenant visibility controls for catalog listings

Acceptance criteria:
- Admins can pin/rollback versions; licensing enforced; vendors self-serve with visibility and quotas.

### I. Data Model Extensions (migrations)
- [ ] `runtime_checkpoints` table
- [ ] `dead_letters` table
- [ ] `usage_counters` table
- [ ] `licenses`, `tenant_visibility` tables
- [ ] Constraints: uniqueness and FKs for integrity (e.g., version uniqueness, attempt idempotency)

### J. Migration & Backfill
- [ ] Native→registry wrapper to list native content in catalog for unified picker
- [ ] Remap tool to backfill `assignment_targets` from existing assignments
- [ ] Data exporters for providers (limited, anonymized)

### K. Rollout & Flags
- [ ] Feature flags: `EXTERNAL_COURSES`, `RUNTIME_API_V2`, `BUNDLE_IMPORTER`, `AUTHORING_STUDIO`, `GOVERNANCE`, `VENDOR_PORTAL`
- [ ] Stage rollout per tenant; dark launch conformance harness
- [ ] Operational runbooks and SLOs (latency, error rate)

Success metrics:
- Time to integrate (days), error rate < 0.5% for runtime writes, P95 latency < 300ms, 0 PII leaks (by audit), conformance score ≥ 95%.
