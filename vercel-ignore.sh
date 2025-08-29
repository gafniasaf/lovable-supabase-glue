#!/usr/bin/env bash
set -euo pipefail

# Skip builds triggered by the Lovable bot
if [ "${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}" = "lovable-dev[bot]" ]; then
  echo "Skip build: lovable-dev[bot] commit"
  exit 0
fi

# Skip if apps/web did not change
CHANGED=$(git diff --name-only "${VERCEL_GIT_PREVIOUS_COMMIT_SHA:-}" "${VERCEL_GIT_COMMIT_SHA:-}" || true)
echo "Changed files:\n$CHANGED"
echo "$CHANGED" | grep -qE '^apps/web/' || { echo "Skip build: no apps/web changes"; exit 0; }

# Otherwise, proceed with build
exit 1


