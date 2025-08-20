import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('children directory filters, shows totals/CSV, and navigates to print card', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  // Seed as admin
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  let resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-1' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'stu-2' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/parent-links', { data: { parent_id: 'test-parent-id', student_id: 'abc-3' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();

  // As parent: filter by 'stu-'
  await context.addCookies([{ name: 'x-test-auth', value: 'parent', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/labs/parent/children-directory?q=stu-');

  const list = page.getByTestId('children-list');
  await expect(list).toBeVisible();
  const rows = list.getByTestId('child-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(2);
  await expect(page.getByTestId('children-total')).toHaveText(String(count));
  await expect(page.getByTestId('children-csv-link')).toBeVisible();

  // Click first row to print
  const firstLink = list.getByTestId('child-student-id').first();
  const firstText = await firstLink.textContent();
  await firstLink.click();
  await expect(page.getByTestId('print-student-card')).toBeVisible();
  await expect(page.getByTestId('print-student-id')).toHaveText(firstText || '');
});


