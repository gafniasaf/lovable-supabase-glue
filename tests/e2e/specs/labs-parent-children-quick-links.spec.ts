import { test, expect } from '@playwright/test';
import { resetWithRetry, prewarmRoutes } from '../utils';

test.beforeEach(async ({ request }) => {
  const ok = await resetWithRetry(request);
  expect(ok).toBeTruthy();
});

test('parent children quick links page shows rows, total, and CSV link', async ({ request, page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');

  // Seed two links as admin
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-1' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-2' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  // Prewarm for parent and then visit
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await prewarmRoutes(request, ['/api/parent-links?parent_id=test-parent-id'], { 'x-test-auth': 'parent' });
  await page.goto('/labs/parent/children-quick-links');
  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  const rows = list.getByTestId('child-row');
  await expect(rows.first()).toBeVisible();
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(2);
  const totalText = await page.getByTestId('children-total').textContent();
  const total = Number(totalText || '0');
  expect(total).toBeGreaterThanOrEqual(2);
  const link = page.getByTestId('children-csv-link');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', /data:text\/csv/);
});


