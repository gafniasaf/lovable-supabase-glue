import { test, expect } from '@playwright/test';

test('admin outcomes page CSV link downloads file for teacher-owned course', async ({ page, request, context, baseURL }) => {
  const headers = { 'x-test-auth': 'teacher' } as any;
  // Create a course as the teacher
  const c = await request.post('/api/courses', { data: { title: 'Report Course', description: '' }, headers });
  expect(c.ok()).toBeTruthy();
  const course = await c.json();

  await page.goto('/admin/outcomes');
  await page.getByPlaceholder('course UUID').fill(course.id);
  const link = page.getByRole('link', { name: 'Download CSV' });
  await expect(link).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    link.click()
  ]);
  const suggested = download.suggestedFilename();
  expect(suggested).toContain('interactive_attempts_');
  expect(suggested).toContain(course.id);
});


