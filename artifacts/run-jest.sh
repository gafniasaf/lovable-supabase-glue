#!/usr/bin/env bash
set -euo pipefail

cd /workspace
npm ci
mkdir -p reports/unit
npm --workspace tests run test 2>&1 | tee reports/unit/jest-run.log
exit ${PIPESTATUS[0]}
