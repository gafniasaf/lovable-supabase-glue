import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('course insights shows first/last lesson and totals', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Course A with 2 lessons
  const A = await request.post('/api/courses', { data: { title: `Course A ${Date.now()}`, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  expect(A.ok()).toBeTruthy();
  const courseA = await A.json();
  const a1 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'First A', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const a2 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'Last A', content: '', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  expect(a1.ok() && a2.ok()).toBeTruthy();

  // Course B with 1 lesson
  const B = await request.post('/api/courses', { data: { title: `Course B ${Date.now()}`, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(B.ok()).toBeTruthy();
  const courseB = await B.json();
  const b1 = await request.post('/api/lessons', { data: { course_id: courseB.id, title: 'Only B', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(b1.ok()).toBeTruthy();

  // Get expected counts from API (robust to any environment variance)
  const aList = await request.get(`/api/lessons?course_id=${courseA.id}`, { headers: { 'x-test-auth': 'teacher' } });
  const bList = await request.get(`/api/lessons?course_id=${courseB.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(aList.ok() && bList.ok()).toBeTruthy();
  const aItems = await aList.json();
  const bItems = await bList.json();
  const aCount = Array.isArray(aItems) ? aItems.length : 0;
  const bCount = Array.isArray(bItems) ? bItems.length : 0;

  await page.goto('/labs/teacher/course-insights');
  await expect(page.getByTestId('insights-table')).toBeVisible();

  const rowA = page.getByTestId('insights-row').filter({ hasText: courseA.id });
  await expect(rowA.getByTestId('cell-lesson-count')).toHaveText(String(aCount));
  await expect(rowA.getByTestId('cell-first-lesson')).toHaveText('First A');
  await expect(rowA.getByTestId('cell-last-lesson')).toHaveText('Last A');

  const rowB = page.getByTestId('insights-row').filter({ hasText: courseB.id });
  await expect(rowB.getByTestId('cell-lesson-count')).toHaveText(String(bCount));
  await expect(rowB.getByTestId('cell-first-lesson')).toHaveText('Only B');
  await expect(rowB.getByTestId('cell-last-lesson')).toHaveText('Only B');

  await expect(page.getByTestId('insights-total-courses')).toHaveText('2');
  await expect(page.getByTestId('insights-total-lessons')).toHaveText(String(aCount + bCount));
});


