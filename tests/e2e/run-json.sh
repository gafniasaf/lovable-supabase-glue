#!/usr/bin/env bash
set -euo pipefail

cd /workspace
npm ci
mkdir -p reports/e2e
mkdir -p tests/test-results
export PW_NO_SERVER=1
export PLAYWRIGHT_BASE_URL=http://web:3022

# Run via tests workspace to ensure correct Playwright resolution
if npm --workspace tests run test:e2e -- -c ./e2e/playwright.config.ts --project=folio-chromium --reporter=json=/workspace/tests/test-results/summary.json; then
  echo "JSON report written to tests/test-results/summary.json"
else
  echo "Falling back to tee pipeline"
  npm --workspace tests run test:e2e -- -c ./e2e/playwright.config.ts --project=folio-chromium --reporter=json | tee /workspace/tests/test-results/summary.json || true
fi

cp -r tests/test-results reports/e2e/ || true


