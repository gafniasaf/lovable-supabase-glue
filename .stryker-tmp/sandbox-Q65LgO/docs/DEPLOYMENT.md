## Deployment guide

### Prerequisites
- Node 20+, npm
- Supabase project (URL and anon key)
- Storage bucket: `public` (or set `NEXT_PUBLIC_UPLOAD_BUCKET`)

### Environments
- Dev: use `docs/env-example.web.txt` as a base
- Staging/Prod: set at minimum:
  - `NEXT_PUBLIC_SUPABASE_URL` (https)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional runtime v2: `RUNTIME_API_V2=1`, `NEXT_RUNTIME_PUBLIC_KEY`, `NEXT_RUNTIME_PRIVATE_KEY`, `NEXT_RUNTIME_KEY_ID`
  - Optional CSRF: `CSRF_DOUBLE_SUBMIT=1`
  - Rate limits: tune as needed (`GLOBAL_MUTATION_RATE_LIMIT`, per-feature limits)

### Build and start
```
npm --workspace apps/web run build
PORT=3022 npm --workspace apps/web run start
```

### Health and metrics
- Health: `GET /api/health` → `{ ok: true, dbOk, storageOk, providers, requiredEnvs, csrfDoubleSubmit }`
- Metrics: `GET /api/admin/metrics` (requires admin)

### CI contract pings
- Configure GitHub secret `CONTRACT_BASE_URL` to your staging/prod URL
- Nightly workflow `.github/workflows/contract-ping.yml` validates endpoints and warns on latency regressions
- Override budgets via env `CONTRACT_BUDGET_<name>=<ms>`

### Security headers
- Enabled by middleware: CSP (nonce), HSTS (prod), Referrer-Policy, X-CTO, XFO, Permissions-Policy, COOP, CORP
- Optional COEP: set `COEP=1` if cross-origin isolation is required

### Jobs (optional)
- Due-soon notifications: `DUE_SOON_JOB=1` (intervals configurable)
- Data retention cleanup: `DATA_RETENTION_JOB=1` (intervals and TTLs configurable)

### Deployment (Vercel)

Prereqs
- Vercel account linked to GitHub (import this repo)
- Supabase project (copy URL and anon key)

Environment variables (Project Settings > Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional: `NEXT_PUBLIC_BASE_URL` (auto on Vercel)
- JWT for interactive launch (production):
  - `NEXT_RUNTIME_PRIVATE_KEY` (PKCS#8 PEM), `NEXT_RUNTIME_KEY_ID` (optional)
  - Dev-only fallback: `NEXT_RUNTIME_SECRET` (HS256) — do not set in production
- Guards:
  - Ensure `TEST_MODE` is NOT set in production; code rejects `x-test-auth` when not in test-mode
  - Optional: `MVP_PROD_GUARD=1` to disable non-MVP endpoints in production
 - Logging: `LOG_LEVEL`, optional pretty logs `PINO_PRETTY=1` (dev only)

Build settings
- Framework: Next.js
- Root directory: `apps/web`
- Install command: `npm ci` (repo root) or leave default
- Build command: `npm --prefix apps/web run build`
- Output: .next (default)

Notes
- Next.js Route Handlers serve the API (no separate backend needed)
- Use Supabase RLS policies from `supabase/migrations` in your Supabase project
- Configure a custom domain as needed
- Security headers: `next.config.mjs` configures CSP, HSTS, Referrer-Policy, and Permissions-Policy; verify in responses

Smoke check after deploy
- Visit `/api/health` -> `{ ok: true }`
- Open `/dashboard` and test sign-in/out
- Security smoke:
  - Attempt a request with `x-test-auth` — should be rejected
  - Check response headers for CSP/HSTS; verify `x-request-id` is returned


