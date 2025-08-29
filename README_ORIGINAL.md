## Education Platform v2

Monorepo for a minimal education platform built with Next.js (App Router), Supabase, Zod, and automated tests (Jest + Playwright).

- App: `apps/web` (Next.js 14)
- Shared library: `packages/shared` (Zod schemas, env helpers)
- Tests: `tests` (unit + e2e)

### Quick start

```bash
npm install
npm run dev              # starts apps/web
npm test                 # Jest unit tests
npm run test:e2e         # Playwright e2e tests
```

Quick demo without backend (TEST_MODE):

```bash
# Dev server in TEST_MODE with in-memory data and role cookie support
npm --workspace apps/web run dev:test   # http://localhost:3020

# Seed rich demo data and switch roles from the header (or hit):
#   GET /api/test/seed?hard=1 (idempotent)
#   POST /api/test/switch-role { role: "teacher|student|parent|admin" }
```

Useful app scripts:

```bash
npm --workspace apps/web run dev        # port 3000
npm --workspace apps/web run dev:test   # TEST_MODE=1 (port 3020)
npm --workspace apps/web run dev:e2e    # TEST_MODE=1 (port 3030)
```

### ExpertFolio (walking skeleton)

Set `FEATURES_EXPERTFOLIO=1` to enable feature-flagged ExpertFolio endpoints:
- `POST /api/ef/assessments` — create assessment (in-memory adapter for Part 1)
- `POST /api/ef/evaluations` — create evaluation (in-memory adapter for Part 1)

All 2xx JSON responses are validated via `jsonDto` and include `x-request-id`. Part 2 adds DB/RLS.

Multi-Dev quickstart:

```bash
# Create per-dev env
# apps/web/.env.developer-alice.local
#   DEV_ID=alice
#   WEB_PORT=3022
#   NEXT_PUBLIC_BASE_URL=http://localhost:3022
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
#   NEXT_PUBLIC_UPLOAD_BUCKET=uploads_alice

# Windows PowerShell
set WEB_PORT=3022; npm --workspace apps/web run dev:test
```

E2E (Playwright):

```bash
# Fast smoke running in TEST_MODE against dev:e2e
npm run smoke-test

# Full CI-style run (build → start on :3022 → tests)
npm run e2e
```

Security hardening (env flags):

- CSRF double-submit: set `CSRF_DOUBLE_SUBMIT=1` and send cookie `csrf_token` plus header `x-csrf-token` on mutations.
- Global mutation rate limit: `GLOBAL_MUTATION_RATE_LIMIT`, `GLOBAL_MUTATION_RATE_WINDOW_MS`.
- Interactive runtime (prod): set `INTERACTIVE_RUNTIME=1` and provide `NEXT_RUNTIME_PRIVATE_KEY` (RS256 PKCS8). In production, HS256 is disabled.

### Documentation

- `docs/architecture.md` — architecture, SSR/auth, services, utilities
- `docs/api.md` — endpoints, contracts, examples, auth requirements
- `docs/data-model.md` — schema + RLS policies (Supabase migrations)
- `docs/product-plan.md` — product plan and External Courses roadmap
- `docs/roadmap.md` — milestone plan, including External Course Registry phases
- `docs/DEPLOYMENT.md` — Vercel deployment steps
- `docs/testing.md` — Jest + Playwright, test-mode, examples
- `docs/observability.md` — logging, request IDs, route timing
- `docs/roles.md` — application roles and permissions
- `docs/runtime-v2.md` — External Runtime API v2 integration guide (draft)
- `docs/runbook.md` — ops and governance runbook (DLQ, usage, licenses, exports)
- `docs/parallel-work.md` — how Coders A (Frontend), B (Backend), C (QA) work safely in parallel
- `docs/start-here.md` — one-line onboarding: “you are coder A/B/C, scan the system and proceed”
 - `docs/tasks/coder-A.md` — Frontend/UI to-do plan (independent track)
 - `docs/tasks/coder-B.md` — Backend/API/DB to-do plan (independent track)

Environment:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` required for real auth/DB
- `TEST_MODE=1` enables SSR/auth bypass and in-memory store for tests

Frontend–backend decoupling (recommended working mode):

- UI talks to a small gateway layer that can use either a real backend (Supabase) or an in-memory TestGateway. This keeps UI/UX development and tests unblocked while backend evolves.


