### API runtime verification (for Vercel)

- **Scope scanned**: `apps/web/src/app/api/**/route.ts`
- **Files found**: 86
- **Explicit runtime declarations found**: 0
- **Edge runtime usage found**: 0
- **Default**: Next.js App Router defaults to Node.js runtime on Vercel for route handlers.

### Critical routes recommended to declare runtime explicitly
- `apps/web/src/app/api/ef/assessments/route.ts`
- `apps/web/src/app/api/ef/evaluations/route.ts`
- `apps/web/src/app/api/ef/read/trainee/route.ts`
- `apps/web/src/app/api/ef/read/supervisor/route.ts`
- `apps/web/src/app/api/ef/read/program/route.ts`
- `apps/web/src/app/api/ef/files/upload-url/route.ts`
- `apps/web/src/app/api/ef/files/download-url/route.ts`
- `apps/web/src/app/api/diag/errors/route.ts`
- `apps/web/src/app/api/internal/metrics/route.ts`

Reason: These routes use Node APIs and/or Supabase client/server features where Node runtime is preferred. While default is Node, making it explicit reduces risk of regressions.

### Notes
- Diagnostics endpoints are already guarded to return 404 in production (`TEST_MODE=0`).
- No routes marked as Edge; no changes strictly required for Vercel, but adding `export const runtime = 'nodejs'` to the above files is a safe hardening step.


