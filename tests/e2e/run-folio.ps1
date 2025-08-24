$ErrorActionPreference = 'Stop'
$env:PW_NO_SERVER = '1'
$env:PLAYWRIGHT_BASE_URL = 'http://localhost:3022'
$env:PLAYWRIGHT_BASE_URL_FOLIO = 'http://localhost:3022'
$env:PW_TEST_AUTH = 'teacher'
npx playwright test -c tests/e2e/playwright.config.ts --project=folio-chromium -g "ExpertFolio submit"

