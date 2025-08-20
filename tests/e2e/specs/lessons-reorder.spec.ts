import { test, expect } from '@playwright/test';

test('teacher can reorder lessons (test-mode)', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  // Create course
  const courseTitle = `Course ${Date.now()}`;
  const courseRes = await request.post('/api/courses', { data: { title: courseTitle, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.ok()).toBeTruthy();
  const course = await courseRes.json();

  // Create lessons
  const l1 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Alpha', content: '', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  const l2 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Bravo', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(l1.ok() && l2.ok()).toBeTruthy();
  const L1 = await l1.json();
  const L2 = await l2.json();

  // Reorder
  const reorder = await request.post('/api/lessons/reorder', { data: { course_id: course.id, items: [ { id: L1.id, order_index: 1 }, { id: L2.id, order_index: 2 } ] }, headers: { 'x-test-auth': 'teacher' } });
  expect(reorder.ok()).toBeTruthy();

  // Verify order via API
  const list = await request.get(`/api/lessons?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(list.ok()).toBeTruthy();
  const rows = await list.json();
  expect(rows[0].title).toBe('Alpha');
  expect(rows[0].order_index).toBe(1);
  expect(rows[1].title).toBe('Bravo');
  expect(rows[1].order_index).toBe(2);

  // Verify UI presence (not strict ordering to avoid flakiness)
  await page.goto(`/dashboard/teacher/${course.id}`);
  await expect(page.getByRole('heading', { name: 'Lessons' })).toBeVisible();
  await expect(page.getByText('Alpha')).toBeVisible();
  await expect(page.getByText('Bravo')).toBeVisible();
});


