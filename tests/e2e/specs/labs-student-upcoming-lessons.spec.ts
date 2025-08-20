import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('upcoming lessons lists first two per enrolled course', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Teacher creates two courses with 2 lessons each
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const c1 = await request.post('/api/courses', { data: { title: `Course A ${Date.now()}`, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  expect(c1.status()).toBe(201);
  const course1 = await c1.json();
  const c2 = await request.post('/api/courses', { data: { title: `Course B ${Date.now()}`, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(c2.status()).toBe(201);
  const course2 = await c2.json();

  for (const [cid, prefix] of [[course1.id, 'A'], [course2.id, 'B']] as const) {
    const r1 = await request.post('/api/lessons', { data: { course_id: cid, title: `${prefix}01`, content: 'x', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
    expect(r1.ok()).toBeTruthy();
    const r2 = await request.post('/api/lessons', { data: { course_id: cid, title: `${prefix}02`, content: 'y', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
    expect(r2.ok()).toBeTruthy();
  }

  // Student enrolls in both
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const e1 = await request.post('/api/enrollments', { data: { course_id: course1.id }, headers: { 'x-test-auth': 'student' } });
  expect(e1.status()).toBe(201);
  const e2 = await request.post('/api/enrollments', { data: { course_id: course2.id }, headers: { 'x-test-auth': 'student' } });
  expect(e2.status()).toBe(201);

  // Visit page
  await page.goto('/labs/student/upcoming-lessons');
  const list = page.getByTestId('upcoming-list');
  await expect(list).toBeVisible();
  const rows = page.getByTestId('upcoming-row');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(4);
  // Ensure the first lessons for each course appear
  await expect(page.getByText('A01')).toBeVisible();
  await expect(page.getByText('B01')).toBeVisible();
});


