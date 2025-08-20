import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('lesson audit pro filters by severity, sorts by content desc, and has CSV', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed one course with three lessons of varying sizes
  const C = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'C' }, headers: { 'x-test-auth': 'teacher' } });
  expect(C.ok()).toBeTruthy();
  const course = await C.json();
  const small = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Small', content: 'x'.repeat(50), order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const medium = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Medium', content: 'y'.repeat(300), order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  const large = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Large', content: 'z'.repeat(1200), order_index: 3 }, headers: { 'x-test-auth': 'teacher' } });
  expect(small.ok() && medium.ok() && large.ok()).toBeTruthy();

  // Filter by severity=high should only include the large one
  await page.goto('/labs/teacher/lesson-audit-pro?severity=high');
  await expect(page.getByTestId('audit-table')).toBeVisible();
  const highRows = page.getByTestId('audit-row');
  await expect(highRows).toHaveCount(1);
  await expect(highRows.first().getByTestId('cell-lesson-title')).toHaveText('Large');
  await expect(page.getByTestId('audit-total-lessons')).toHaveText('1');
  await expect(page.getByTestId('audit-csv-link')).toHaveAttribute('href', /^(data:text\/csv)/);

  // Sort by content desc should show Large, Medium, Small
  await page.goto('/labs/teacher/lesson-audit-pro?sort=content&dir=desc');
  const sorted = page.getByTestId('audit-row');
  await expect(sorted.nth(0).getByTestId('cell-lesson-title')).toHaveText('Large');
  await expect(sorted.nth(1).getByTestId('cell-lesson-title')).toHaveText('Medium');
  await expect(sorted.nth(2).getByTestId('cell-lesson-title')).toHaveText('Small');
});


