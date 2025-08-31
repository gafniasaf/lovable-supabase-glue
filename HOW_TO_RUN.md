## How to Run the Integrated EDU App (Next.js)

This repository contains a legacy Next.js app with the integrated EDU UI under `apps/web` (App Router). Below are the minimal steps to build, test, and run locally on Windows with visible logs and reports.

### Prerequisites
- Node.js 18+ and npm
- PowerShell (Windows) for E2E orchestration script

### Install dependencies
```powershell
npm install
```

### Run Jest UI tests (with coverage and artifacts)
```powershell
npm run test --silent
```
- UI test logs: `artifacts/ui/jest-run-*.txt`
- Coverage HTML: `reports/ui/coverage/lcov-report/index.html`
- JUnit: `reports/ui/junit.xml`

### Run Playwright E2E tests (build + start + test)
Use the provided PowerShell script. It will kill any process on port 3077, build and start Next.js on `127.0.0.1:3077`, wait for health, then run Playwright.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/e2e/run-e2e.ps1
```
- E2E logs (server + runner): `artifacts/e2e/*.txt`
- HTML report: `reports/e2e/html/index.html`

### Manually start the app (optional)
```powershell
npm --workspace apps/web run start:e2e
# Starts Next.js on 127.0.0.1:3077 (builds then serves)
```
Then open:
- `http://127.0.0.1:3077/edu/courses`
- `http://127.0.0.1:3077/edu/assignments`
- `http://127.0.0.1:3077/edu/lessons`
- `http://127.0.0.1:3077/edu/sandbox`
- `http://127.0.0.1:3077/edu/audit-logs`

### Environment variables (Supabase)
The Supabase client is made SSR-safe: if env vars are missing it becomes a no-op so builds/tests do not fail.

To use a real Supabase project, set these before running the app:
```powershell
$env:NEXT_PUBLIC_SUPABASE_URL = 'https://<project>.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = '<anon-key>'
```

Alternatively, copy `ENV.EXAMPLE` to `.env.local` (or `.env`) at the repo root and fill in the values. Next.js will load these automatically when building/starting the app.

To force mock data for audit logs during tests or local runs, set:
```powershell
$env:NEXT_PUBLIC_SUPABASE_USE_MOCK = '1'
```

### Lighthouse CI (CI only)
- A workflow runs Lighthouse against `/edu/courses` and stores reports under `reports/lhci/` as CI artifacts.

### Deployment notes
- Pushes to the active branch (e.g., `feature/edu-stabilization`) will trigger a Vercel deployment for this project.

### Artifacts and reports
- UI/Jest logs: `artifacts/ui/`
- E2E/Playwright logs: `artifacts/e2e/`
- UI coverage: `reports/ui/coverage/`
- E2E HTML report: `reports/e2e/html/`

### Troubleshooting
- Port 3077 already in use: the E2E script will terminate listeners automatically.
- Build fails on audit logs route due to Supabase env: ensure the env vars are set, or rely on the SSR-safe no-op behavior included here.
- E2E flakiness: we assert stable elements and HTML for header nav; route waits can be added if click-through navigation is required.


