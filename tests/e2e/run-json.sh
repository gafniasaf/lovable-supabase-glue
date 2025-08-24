#!/usr/bin/env bash
set -euo pipefail

cd /workspace
npm ci
mkdir -p reports/e2e
export PW_NO_SERVER=1
export PLAYWRIGHT_BASE_URL=http://web:3022
npx playwright test -c tests/e2e/playwright.config.ts --project=folio-chromium --reporter=json=/workspace/reports/e2e/summary.json || true
cp -r tests/test-results reports/e2e/ || true


