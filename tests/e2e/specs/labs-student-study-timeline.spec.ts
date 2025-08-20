import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('study timeline distributes minutes over 7 days and exposes CSV', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Teacher: create course + 3 lessons with known sizes
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const courseRes = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.status()).toBe(201);
  const course = await courseRes.json();

  const sizes = [500, 1200, 800]; // total 2500 chars => ceil(2.5) = 3 minutes
  for (let i = 0; i < sizes.length; i++) {
    const r = await request.post('/api/lessons', { data: { course_id: course.id, title: `L0${i+1}`, content: 'a'.repeat(sizes[i]), order_index: i + 1 }, headers: { 'x-test-auth': 'teacher' } });
    expect(r.ok()).toBeTruthy();
  }

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  await page.goto('/labs/student/study-timeline');
  const table = page.getByTestId('timeline-table');
  await expect(table).toBeVisible();

  // Verify totals per row sum to expected minutes (3)
  const row = page.getByTestId('timeline-row').filter({ has: page.getByTestId('cell-course-id').getByText(course.id) });
  await expect(row).toHaveCount(1);
  const cells = await row.getByRole('cell').allTextContents();
  // cells: [course_id, d1..d7, total]
  const dayVals = cells.slice(1, 8).map(Number);
  const sum = dayVals.reduce((a, b) => a + b, 0);
  expect(sum).toBeGreaterThanOrEqual(3);
  await expect(row.getByTestId('timeline-total-minutes')).toHaveText('3');

  // CSV present
  await expect(page.getByTestId('timeline-csv-link')).toBeVisible();
});


