// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  // Reset server-side test state
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/test/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('system health without auth shows ok and testRole=null', async ({ page }) => {
  await page.goto('/labs/system/health');
  await expect(page.getByTestId('system-health-panel')).toBeVisible();
  await expect(page.getByTestId('status-ok')).toHaveText('true');
  await expect(page.getByTestId('status-test-role')).toHaveText('null');
});

test('system health with teacher auth shows testRole=\'teacher\'', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/labs/system/health');
  await expect(page.getByTestId('status-test-role')).toHaveText('teacher');
});


