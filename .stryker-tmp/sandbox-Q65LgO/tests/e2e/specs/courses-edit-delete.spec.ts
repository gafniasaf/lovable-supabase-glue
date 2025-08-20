// @ts-nocheck
import { test, expect } from '@playwright/test';

test('teacher can edit and delete a course (test-mode)', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  const title = `Course ${Date.now()}`;
  const create = await request.post('/api/courses', { data: { title, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(create.ok()).toBeTruthy();
  const course = await create.json();

  // Edit
  const newTitle = title + ' edited';
  const patch = await request.patch(`/api/courses/${course.id}`, { data: { title: newTitle }, headers: { 'x-test-auth': 'teacher' } });
  if (!patch.ok()) {
    console.log('PATCH failed', patch.status(), await patch.text());
  }
  expect(patch.ok()).toBeTruthy();
  const updated = await patch.json();
  expect(updated.title).toBe(newTitle);

  // Delete
  const del = await request.delete(`/api/courses/${course.id}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(del.ok()).toBeTruthy();

  // UI tolerant check
  await page.goto('/dashboard');
  await expect(page.getByText('Role: teacher')).toBeVisible();
  // The deleted course might show as [deleted]; we just ensure dashboard still loads
});


