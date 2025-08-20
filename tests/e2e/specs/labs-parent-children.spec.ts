import { test, expect } from '@playwright/test';
import { resetWithRetry, prewarmRoutes } from '../utils';

test.beforeEach(async ({ request }) => {
  const ok = await resetWithRetry(request);
  expect(ok).toBeTruthy();
});

test('parent children list and detail', async ({ request, page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');

  // Seed as admin
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'test-student-id' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  // Switch to parent
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await prewarmRoutes(request, ['/api/parent-links?parent_id=test-parent-id'], { 'x-test-auth': 'parent' });
  await page.goto('/labs/parent/children');
  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  const firstLink = list.getByTestId('child-student-id').first();
  await expect(firstLink).toHaveText('test-student-id');

  await firstLink.click();
  await expect(page.getByTestId('child-detail')).toBeVisible();
  await expect(page.getByTestId('child-detail-student-id')).toHaveText('test-student-id');
});


