import { test, expect } from '@playwright/test';
import { resetWithRetry, prewarmRoutes } from '../utils';

test.beforeEach(async ({ request }) => {
  const ok = await resetWithRetry(request);
  expect(ok).toBeTruthy();
});

test('parent children report shows total and rows', async ({ request, page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');

  // Seed as admin
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  // Cleanup any existing links for this parent to make test deterministic
  const existing = await request.get('/api/parent-links?parent_id=test-parent-id', { headers: { 'x-test-auth': 'admin' } });
  if (existing.ok()) {
    const rows = await existing.json();
    for (const row of rows) {
      await request.delete('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: row.student_id }, headers: { 'x-test-auth': 'admin' } });
    }
  }

  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'test-student-id' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'another-student-id' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  // Switch to parent
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await prewarmRoutes(request, ['/api/parent-links?parent_id=test-parent-id'], { 'x-test-auth': 'parent' });
  await page.goto('/labs/parent/children-report');
  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  await expect(list.getByTestId('child-row')).toHaveCount(2);
  await expect(page.getByTestId('children-total')).toHaveText('2');
});


