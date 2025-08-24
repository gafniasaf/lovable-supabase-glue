import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  forbidOnly: !!process.env.CI,
  globalSetup: './global-setup.ts',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  // If we start server outside (preferred), set PW_NO_SERVER=1
  workers: Number(process.env.PW_WORKERS || 1),
  webServer: process.env.PW_NO_SERVER ? undefined : {
    command: 'node ./start-web.js',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030',
    reuseExistingServer: true,
    timeout: 120_000
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      // Enable test-mode auth bypass for server-side code
      'x-test-auth': process.env.PW_TEST_AUTH || ''
    }
  },
  projects: [
    {
      name: 'edu-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL_EDU
          || process.env.PLAYWRIGHT_BASE_URL
          || 'http://localhost:3030'
      }
    },
    {
      name: 'folio-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.PLAYWRIGHT_BASE_URL_FOLIO
          || (process.env.PLAYWRIGHT_BASE_URL ? `${process.env.PLAYWRIGHT_BASE_URL.replace(/\/$/, '')}` : 'http://localhost:3030')
      }
    }
  ]
});


