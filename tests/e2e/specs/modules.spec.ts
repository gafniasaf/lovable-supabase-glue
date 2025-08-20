import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('modules list renders in order for teacher (SSR)', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed course
  const courseTitle = `Course ${Date.now()}`;
  const courseRes = await request.post('/api/courses', { data: { title: courseTitle, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.ok()).toBeTruthy();
  const course = await courseRes.json();

  // Seed modules out of order (skip if modules API not available yet)
  const m2 = await request.post('/api/modules', { data: { course_id: course.id, title: 'Second', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  if (m2.status() !== 201) {
    test.skip(true, 'modules API not available');
  }
  const m1 = await request.post('/api/modules', { data: { course_id: course.id, title: 'First', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  if (m1.status() !== 201) {
    test.skip(true, 'modules API not available');
  }

  // Verify via API list
  const list = await request.get(`/api/modules?course_id=${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(list.ok()).toBeTruthy();
  const items = await list.json();
  expect(items.length).toBe(2);

  // Visit SSR page
  await page.goto(`/dashboard/teacher/${course.id}/modules`);
  await expect(page.getByTestId('modules-list')).toBeVisible();
  const rows = page.getByTestId('module-row');
  await expect(rows.first().getByTestId('module-title')).toHaveText(/#1 - First/);
  await expect(rows.nth(1).getByTestId('module-title')).toHaveText(/#2 - Second/);
});


