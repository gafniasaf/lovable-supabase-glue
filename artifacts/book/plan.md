Build Fast with Confidence — Book Alignment Plan (v1)

Scope
- Audience: Non-coders using Cursor to build modern web apps rapidly
- Products: Education Platform (courses/assignments) and Experfolio (competency/EPAs) powered by one engine
- Style: Plain-English narrative with practical examples and templates

System anchors (from repo)
- Next.js 14 App Router with API Route Handlers: `apps/web/src/app`
- Frontend Gateways: `apps/web/src/lib/data/*` (contracts-first via Zod; SSR correctness)
- Services (ports/adapters, modular monolith): `apps/web/src/server/services/*`
- Supabase Postgres with RLS: `supabase/migrations/*`
- DTOs + shared schemas: `packages/shared/src/schemas/*`, `packages/shared/src/dto/*`
- Response DTO validation helper: `apps/web/src/lib/jsonDto.ts`
- Security: middleware CSP nonces + headers, request IDs, CSRF, rate limits: `apps/web/middleware.ts`, `apps/web/src/server/{apiHandler,withRouteTiming}.ts`
- Files: presigned upload/download, quotas, allowlist, finalize: `apps/web/src/app/api/files/*`, gateway `src/lib/data/files.ts`
- Analytics/Reports: `apps/web/src/app/api/reports/*`, events and metrics, `analytics.ts`, request timing
- Runtime v2 (interactive): `apps/web/src/app/api/runtime/*`, CORS + aud binding, RS256 keys, registry/providers endpoints
- Testing: Jest (unit/integration) + Playwright (E2E), test-mode via `x-test-auth` and `TEST_MODE`

Chapter map with alignment notes
1) The Story — Two Apps, One Engine
   - Messaging: one engine, different labels; Experfolio = competency/EPA branch
   - Ground in facts: Gateways, SSR, shared DTOs, RLS keep the engine generic

2) Getting Started with Cursor — From Idea to Working Screen
   - Prompts with URL, fields, roles, freshness
   - Mention gateways pattern and contracts-first DTOs

3) Next.js — Making Websites Way Easier
   - App Router, server components, API routes, middleware request IDs
   - Page performance and SSR data via gateways

4) React — Building Screens Like Legos
   - Reusable components; consistent cards/badges/grids; instant UI updates

5) Supabase — Your Data Safe and Organized
   - RLS policies; teacher/student/parent/admin scopes; storage buckets

6) DTOs and JSON — Speaking the Same Language
   - Shared Zod schemas; response validation with `jsonDto`; error envelope with `requestId`

7) Security Made Simple — Keeping the Bad Guys Out
   - JWT/JWKS, CSRF checks, CSP+nonce, time-limited links, rate limits, request IDs
   - Test-mode protections: production rejection of `x-test-auth`

8) Testing — Your Safety Net
   - Jest, Playwright, test-mode seeds, `x-request-id` in failures, artifacts

9) Files and Uploads — Handling Attachments Safely
   - Upload allowlist, quotas, AV stub in test-mode, presigned URLs, ownership checks, downloads

10) Analytics — Numbers That Actually Help
   - Reports, event capture, `x-total-count`, timing/metrics, privacy-aware aggregations

11) Runtime v2 — Playing Nice with Other Tools
   - Context/auth exchange, outcomes/events, CORS, aud binding, RS256 keys, provider registry and health

12) Going Live — Your Pre-Flight Checklist
   - Env validation, security headers, canary/flags, monitoring, rollback, quotas

Appendix — Quick Reference and Templates
   - Request templates (page, form, export, access), feature flags, problem reports

Terminology decisions
- Use “Experfolio” for the competency/EPA branch brand
- Keep error envelope: `{ error: { code, message }, requestId }`
- Keep role names: student, teacher, parent, admin; supervisor maps to teacher in Experfolio context

Deliverables rhythm
- Produce one polished chapter per iteration (saved under `artifacts/book/chapter-XX.md`)
- Keep the style plain-English; examples mirror actual endpoints and capabilities

