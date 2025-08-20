import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('advanced directory filters by q, shows aliases and CSV link', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  // Cleanup any existing links for deterministic assertions
  const existing = await request.get('/api/parent-links?parent_id=test-parent-id', { headers: { 'x-test-auth': 'admin' } });
  if (existing.ok()) {
    const rows = await existing.json();
    for (const row of rows) {
      await request.delete('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: row.student_id }, headers: { 'x-test-auth': 'admin' } });
    }
  }
  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-100' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-200' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'x-300' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/labs/parent/children-directory-advanced?q=stu');
  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  await expect(list.getByTestId('child-row')).toHaveCount(2);
  // Aliases are first four chars uppercased: 'STU-'
  await expect(list.getByTestId('child-alias').first()).toHaveText(/STU-/);
  await expect(page.getByTestId('children-csv-link')).toBeVisible();
});


