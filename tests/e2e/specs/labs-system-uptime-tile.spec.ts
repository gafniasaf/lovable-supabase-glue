import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('uptime tile renders ok and timestamps without auth', async ({ page }) => {
  await page.goto('/labs/system/uptime-tile');
  await expect(page.getByTestId('uptime-ok')).toHaveText('true');
  await expect(page.getByTestId('uptime-ts-iso')).toContainText('T');
  await expect(page.getByTestId('uptime-ts-human')).toContainText('ago');
  await expect(page.getByTestId('uptime-test-role')).toHaveText('null');
});

test('uptime tile shows teacher role when cookie set', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/labs/system/uptime-tile');
  await expect(page.getByTestId('uptime-test-role')).toHaveText('teacher');
});


