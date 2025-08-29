#!/usr/bin/env bash
set -euo pipefail

# Skip builds triggered by the Lovable bot
if [ "${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}" = "lovable-dev[bot]" ]; then
  echo "Skip build: lovable-dev[bot] commit"
  exit 0
fi

CHANGED=$(git diff --name-only "${VERCEL_GIT_PREVIOUS_COMMIT_SHA:-}" "${VERCEL_GIT_COMMIT_SHA:-}" || true)
printf "Changed files:\n%s\n" "$CHANGED"

# Proceed if root vite app or configs changed
if echo "$CHANGED" | grep -qE '^(src/|index.html|vite.config|package.json|public/|tailwind\.config|postcss\.config|\.github/|packages/)'; then
  echo "Proceed with build: relevant paths changed"
  exit 1
fi

echo "Skip build: no relevant changes"
exit 0


