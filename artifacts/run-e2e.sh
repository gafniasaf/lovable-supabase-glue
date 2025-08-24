#!/usr/bin/env bash
set -euo pipefail

cd /workspace
npm ci
npm --workspace tests run test:e2e || true
mkdir -p reports/e2e artifacts/e2e
cp -r tests/test-results reports/e2e/ || true
cp -r tests/test-results artifacts/e2e/ || true
