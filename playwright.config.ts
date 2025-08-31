import { defineConfig } from '@playwright/test';

const useExternalServer = !!process.env.PW_EXTERNAL_SERVER;

const config = defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/e2e/html' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:3077',
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  webServer: {
    command: 'cmd /c "cd apps/web && set PORT=3077&& set HOSTNAME=127.0.0.1&& set NEXT_DISABLE_SWC_NATIVE=1&& npm run start:e2e"',
    url: 'http://127.0.0.1:3077',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {},
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});

// If an external server is already running, don't let Playwright manage it
if (useExternalServer) {
  // @ts-expect-error - mutate config before export
  delete (config as any).webServer;
}

export default config;


