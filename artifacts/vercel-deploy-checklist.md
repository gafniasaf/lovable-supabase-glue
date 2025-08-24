## Vercel Deployment Checklist (Education + ExpertFolio)

### Project setup
- **Project root**: `apps/web`
- **Framework preset**: Next.js
- **Node version**: 18.x or 20.x (LTS)
- **Install command**: `npm ci`
- **Build command**: `npm run build`
- **Output**: Next.js default

### Environment variables (Production)
- **NODE_ENV**: `production`
- **TEST_MODE**: `0`
- **FEATURES_EXPERTFOLIO**: `1`
- **NEXT_PUBLIC_BASE_URL**: `https://<primary-domain>`
- **NEXT_PUBLIC_SUPABASE_URL**: `<your-supabase-url>`
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `<anon-key>`
- (optional server) **SUPABASE_SERVICE_ROLE_KEY**: `<service-role-key>`
- **NEXT_PUBLIC_UPLOAD_BUCKET**: `public`
- **CSRF_DOUBLE_SUBMIT**: `1`
- **MVP_PROD_GUARD**: `0`

### Domains & routing (tenancy/product resolution)
- Add domains under same Vercel Project:
  - Education product: `your-domain.com`
  - ExpertFolio product: `folio.your-domain.com`
- Confirm `apps/web/src/lib/tenant.ts` host mapping:
  - `folio.*` → `product=expertfolio`
  - otherwise → `product=education`

### API routes runtime
- Ensure Node.js runtime for server features (logging, supabase):
  - Prefer `export const runtime = 'nodejs'` for API routes if any defaults differ

### Security
- TEST_MODE-only diagnostics must be 404 in prod:
  - `/api/ef/diag` → 404
  - `/api/diag/errors` → 404 without `TEST_MODE`
- Validate security headers via middleware:
  - CSP nonce, HSTS, Referrer-Policy

### Observability
- Use request id propagation; expose `x-request-id` on errors
- Consider external log drain (Vercel) for serverless persistence
- Metrics endpoint is internal; do not expose publicly

### DB & RLS
- Supabase/Postgres available with RLS policies from migrations
- Idempotency and rate limits rely on DB tables/policies

### Files/Storage
- Ensure Supabase storage bucket exists; CORS if needed
- `storageKey` format: `/<tenant_id>/<product>/<entity>/<id>/<filename>`

### Playwright/CI
- Playwright not run on Vercel deploy; keep in CI
- Ensure GitHub Actions workflow uses JSON reporter to `/reports/e2e/`

### Post-deploy validation
- Health: `GET /api/ready` returns 200
- EF feature flag: `FEATURES_EXPERTFOLIO=1`
- Assessment/Evaluation POSTs return 201 with DTO shape
- Read models return DTO-valid responses

### Canary rollout
- Feature flag per-tenant if applicable; monitor metrics and logs


