import { test, expect } from '@playwright/test';

test('cannot create course when unauthenticated', async ({ request }) => {
  const res = await request.post('/api/courses', { data: { title: 'Title', description: 'D' } });
  expect(res.status()).toBe(401);
});

test('student cannot create course', async ({ request, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const res = await request.post('/api/courses', { data: { title: 'Title', description: 'D' }, headers: { 'x-test-auth': 'student' } });
  expect(res.status()).toBe(403);
});

test('teacher creates a course and it appears in dashboard (test-mode)', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const title = `Course ${Date.now()}`;
  const res = await request.post('/api/courses', { data: { title, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(res.ok()).toBeTruthy();
  // Verify via API list too
  const list = await request.get('/api/courses', { headers: { 'x-test-auth': 'teacher' } });
  expect(list.ok()).toBeTruthy();
  const items = await list.json();
  expect(items.map((c: any) => c.title)).toContain(title);
  // And verify UI landing dashboard shows teacher view
  await page.goto('/dashboard');
  await expect(page.getByText('Role: teacher')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Manage courses' })).toBeVisible();
});


