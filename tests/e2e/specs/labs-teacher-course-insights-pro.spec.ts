import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('course insights pro sorts by contentChars desc and exposes CSV', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed Course A with two lessons (longer total content)
  const A = await request.post('/api/courses', { data: { title: `Course A ${Date.now()}`, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  expect(A.ok()).toBeTruthy();
  const courseA = await A.json();
  await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'A1', content: 'Hello World!!!', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'A2', content: 'ABCDE', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });

  // Seed Course B with one lesson (shorter total content)
  const B = await request.post('/api/courses', { data: { title: `Course B ${Date.now()}`, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(B.ok()).toBeTruthy();
  const courseB = await B.json();
  await request.post('/api/lessons', { data: { course_id: courseB.id, title: 'B1', content: 'Hi', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });

  // Compute expected order and totals from API
  const aList = await request.get(`/api/lessons?course_id=${courseA.id}`, { headers: { 'x-test-auth': 'teacher' } });
  const bList = await request.get(`/api/lessons?course_id=${courseB.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(aList.ok() && bList.ok()).toBeTruthy();
  const aItems = await aList.json();
  const bItems = await bList.json();
  const aCount = Array.isArray(aItems) ? aItems.length : 0;
  const bCount = Array.isArray(bItems) ? bItems.length : 0;
  const aChars = (Array.isArray(aItems) ? aItems : []).reduce((s: number, l: any) => s + (l.content?.length || 0), 0);
  const bChars = (Array.isArray(bItems) ? bItems : []).reduce((s: number, l: any) => s + (l.content?.length || 0), 0);
  const [firstId, secondId] = aChars >= bChars ? [courseA.id, courseB.id] : [courseB.id, courseA.id];

  await page.goto('/labs/teacher/course-insights-pro?sort=contentChars&dir=desc');
  await expect(page.getByTestId('insights-table')).toBeVisible();

  const rows = page.getByTestId('insights-row');
  await expect(rows.first().getByTestId('cell-course-id')).toContainText(firstId);
  await expect(rows.nth(1).getByTestId('cell-course-id')).toContainText(secondId);

  // Totals
  await expect(page.getByTestId('insights-total-courses')).toHaveText('2');
  await expect(page.getByTestId('insights-total-lessons')).toHaveText(String(aCount + bCount));

  // CSV link present
  const csvLink = page.getByTestId('insights-csv-link');
  await expect(csvLink).toBeVisible();
  await expect(csvLink).toHaveAttribute('href', /^(data:text\/csv)/);
});


