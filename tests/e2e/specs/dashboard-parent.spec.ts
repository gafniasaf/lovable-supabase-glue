import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('parent dashboard lists linked student', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  // Admin links parent to student
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const link = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'test-student-id' }, headers: { 'x-test-auth': 'admin' } });
  expect(link.ok()).toBeTruthy();

  // Visit parent dashboard as parent
  await context.clearCookies();
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/dashboard/parent');
  await expect(page.getByTestId('parent-children-list')).toBeVisible();
  await expect(page.getByTestId('parent-child-row').first()).toBeVisible();
});


