import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('content quality report shows rows, totals, and CSV link', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Course A with two lessons of differing content length
  const A = await request.post('/api/courses', { data: { title: `Course A ${Date.now()}`, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  expect(A.ok()).toBeTruthy();
  const courseA = await A.json();
  const a1 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'Short', content: 'Hi', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const a2 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'Longer Title', content: 'This is a longer content body', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  expect(a1.ok() && a2.ok()).toBeTruthy();

  // Course B with one lesson
  const B = await request.post('/api/courses', { data: { title: `Course B ${Date.now()}`, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(B.ok()).toBeTruthy();
  const courseB = await B.json();
  const b1 = await request.post('/api/lessons', { data: { course_id: courseB.id, title: 'Only', content: 'OK', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(b1.ok()).toBeTruthy();

  // Fetch expected counts from API for robustness
  const aList = await request.get(`/api/lessons?course_id=${courseA.id}`, { headers: { 'x-test-auth': 'teacher' } });
  const bList = await request.get(`/api/lessons?course_id=${courseB.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(aList.ok() && bList.ok()).toBeTruthy();
  const aItems = await aList.json();
  const bItems = await bList.json();
  const aCount = Array.isArray(aItems) ? aItems.length : 0;
  const bCount = Array.isArray(bItems) ? bItems.length : 0;

  await page.goto('/labs/teacher/content-quality-report');
  await expect(page.getByTestId('quality-table')).toBeVisible();

  // Two rows and totals
  const rowA = page.getByTestId('quality-row').filter({ hasText: courseA.id });
  await expect(rowA.getByTestId('cell-lesson-count')).toHaveText(String(aCount));
  await expect(rowA.getByTestId('cell-longest-lesson')).toHaveText('Longer Title');
  const rowB = page.getByTestId('quality-row').filter({ hasText: courseB.id });
  await expect(rowB.getByTestId('cell-lesson-count')).toHaveText(String(bCount));
  await expect(page.getByTestId('quality-total-courses')).toHaveText('2');
  await expect(page.getByTestId('quality-total-lessons')).toHaveText(String(aCount + bCount));

  const csvLink = page.getByTestId('quality-csv-link');
  await expect(csvLink).toBeVisible();
  await expect(csvLink).toHaveAttribute('href', /^(data:text\/csv)/);
});


