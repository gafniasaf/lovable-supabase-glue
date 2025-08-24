#!/usr/bin/env bash
set -euo pipefail
cd /workspace
npm ci
export PW_NO_SERVER=1
export PLAYWRIGHT_BASE_URL=http://web:3022
mkdir -p reports/e2e
npx playwright test -c tests/e2e/playwright.config.ts --project=folio-chromium --reporter=json --grep "ExpertFolio" | tee reports/e2e/folio-summary.json || true
