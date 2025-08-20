import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('teacher multi-course print pack shows sections and first lesson rows', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  // Create two courses
  let resp = await request.post('/api/courses', { data: { title: 'C1' }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  const c1 = await resp.json();
  resp = await request.post('/api/courses', { data: { title: 'C2' }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  const c2 = await resp.json();

  // One lesson each
  resp = await request.post('/api/lessons', { data: { course_id: c1.id, title: 'L1-1', content: 'Content 1', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.post('/api/lessons', { data: { course_id: c2.id, title: 'L2-1', content: 'Content 2', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();

  await page.goto(`/labs/teacher/courses-print-pack?ids=${c1.id},${c2.id}`);
  await expect(page.getByTestId('print-pack-total-courses')).toHaveText('2');
  const sections = page.getByTestId('print-pack-course');
  await expect(sections).toHaveCount(2);
  const firstRows = page.getByTestId('print-pack-lesson-row');
  await expect(firstRows.first().getByTestId('lesson-order')).toHaveText('#1');
  await expect(firstRows.first().getByTestId('lesson-title')).toContainText('L1');
});


