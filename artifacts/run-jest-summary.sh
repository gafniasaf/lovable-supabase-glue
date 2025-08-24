#!/usr/bin/env bash
set -euo pipefail
cd /workspace
npm ci
mkdir -p reports/unit
# Produce machine-readable JSON summary; allow no-tests to pass in some environments
npx jest -c tests/jest.config.cjs --json --outputFile=reports/unit/jest-summary.json --passWithNoTests || true
