### How to Run (Docker Compose)

Prerequisites
- Docker Desktop 4.x+
- No local Node/PNPM/npm required

Quick start (local)
1) Build the web image
   - Windows/macOS/Linux:
     - docker compose build web
2) Start the web service (web only)
   - docker compose up -d web
3) Check health
   - Windows PowerShell:
     - powershell -NoProfile -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:3022/api/health).StatusCode"
   - macOS/Linux:
     - curl -i http://localhost:3022/api/health
4) Pause or clean up
   - Pause (keep state):
     - docker compose stop web
   - Clean up containers (keep volumes):
     - docker compose down
   - Full reset (containers + volumes):
     - docker compose down -v

Local overrides
- docker-compose.override.yml is applied automatically by Docker Compose.
- It sets:
  - NODE_ENV=development
  - TEST_MODE=1
  - NEXT_PUBLIC_TEST_MODE=1
  - CSRF_DOUBLE_SUBMIT=0
- Base docker-compose.yml remains prod-like (no dev/test flags).

Profiles
- The tests service is under the "tests" profile and will not run by default.
- To run only if explicitly requested:
  - docker compose --profile tests up tests

E2E JSON report generation
- Generate Playwright JSON report and copy artifacts:
  - docker compose up -d web
  - docker compose run --rm --profile tests tests bash -lc "bash tests/e2e/run-json.sh"
  - docker compose down

Environment variables
- Suppress warnings by setting an explicit allowlist (optional):
  - RUNTIME_CORS_ALLOW=
- Supabase (optional for local dev):
  - NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key-1234567890

Ports
- Web: http://localhost:3022

Notes
- Rebuild only when Dockerfiles, base images, or lockfiles change; otherwise reuse the existing image.
- Healthcheck calls `/api/health` from inside the container using loopback; the compose file uses `127.0.0.1` to avoid DNS/alias issues.
- For stage/prod, unset TEST_MODE and provide real Supabase/runtime keys.

Vercel deployment tips
- vercel.json
  - version: 2, framework: nextjs
  - installCommand: `npm ci --ignore-scripts`
  - buildCommand: `npm --workspace apps/web run build`
  - outputDirectory: `apps/web/.next`
- Leave Root Directory empty (repository root)
- After changing env vars or fixing cached build issues, use "Redeploy without cache"

Troubleshooting
- `husky: command not found` on Vercel: ensure `installCommand` ignores scripts.
- Unicode escape error in route handlers: avoid literal `\t` characters; use spaces.
- CSP blocks Supabase: ensure `connect-src 'self'` and add Supabase host via `RUNTIME_CORS_ALLOW`.
- Anon key errors: ensure the anon key is pasted as a single line (no CR/LF).


ExpertFolio (Feature Flag)
- To enable ExpertFolio endpoints during local/dev runs, set `FEATURES_EXPERTFOLIO=1` in the web service environment (Compose override or environment).
- Endpoints (Part 1 skeleton): `POST /api/ef/assessments`, `POST /api/ef/evaluations`.