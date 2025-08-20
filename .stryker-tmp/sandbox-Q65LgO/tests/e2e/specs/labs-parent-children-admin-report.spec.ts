// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('parent children admin report filters and shows CSV link', async ({ request, page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');

  // Seed two links as admin
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  // Cleanup any existing links for deterministic assertions
  const existing = await request.get('/api/parent-links?parent_id=test-parent-id', { headers: { 'x-test-auth': 'admin' } });
  if (existing.ok()) {
    const rows = await existing.json();
    for (const row of rows) {
      await request.delete('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: row.student_id }, headers: { 'x-test-auth': 'admin' } });
    }
  }
  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'test-student-id' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'other-student' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  // Switch to parent
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  await page.goto('/labs/parent/children-admin-report?q=test-student');
  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  // Should filter down to exactly one matching row
  await expect(list.getByTestId('child-row')).toHaveCount(1);
  await expect(page.getByTestId('children-total')).toHaveText('1');
  await expect(page.getByTestId('children-csv-link')).toBeVisible();
});


