import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  // Prefer new reset path, fallback kept by global-setup too
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('teacher courses grid shows seeded course (read-only)', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  const title = `Course ${Date.now()}`;
  const create = await request.post('/api/courses', { data: { title, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(create.status()).toBe(201);

  await page.goto('/labs/teacher/courses-grid');
  await expect(page.getByTestId('courses-grid')).toBeVisible();
  await expect(page.getByTestId('course-card').filter({ hasText: title })).toBeVisible();
  await expect(page.getByTestId('course-title').filter({ hasText: title })).toBeVisible();
});


