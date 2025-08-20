import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('role badge reflects testRole from health endpoint', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // No cookie: role should be null
  await page.goto('/labs/system/role-badge');
  await expect(page.getByTestId('role-value')).toHaveText('null');

  // With teacher cookie: role should be teacher
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);
  await page.goto('/labs/system/role-badge');
  await expect(page.getByTestId('role-value')).toHaveText('teacher');
  await expect(page.getByTestId('test-mode-value')).toHaveText('true');
});


