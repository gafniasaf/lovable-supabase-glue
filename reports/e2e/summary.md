# E2E Summary (Folio)

- Project: folio-chromium
- Spec: ef-flow.spec.ts (ExpertFolio submit)
- Result: Executed in Docker tests profile; see trace zip(s) under tests/test-results
- Traces: tests/test-results/**/trace.zip

To regenerate JSON summary:

```
docker compose run --rm --profile tests tests bash -lc "npm ci && PW_NO_SERVER=1 PLAYWRIGHT_BASE_URL=http://web:3022 npx playwright test -c tests/e2e/playwright.config.ts --project=folio-chromium -g 'ExpertFolio submit' --reporter=json > /workspace/reports/e2e/summary.json || true"
```
