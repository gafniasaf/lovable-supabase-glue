import { test, expect } from '@playwright/test';

test('teacher course page CSV link triggers download', async ({ page, request, context, baseURL }) => {
  // Ensure teacher auth via cookie like other specs
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);

  // Create a course
  const headers = { 'x-test-auth': 'teacher' } as any;
  let resp: any, course: any;
  for (let i = 0; i < 10; i++) {
    resp = await request.post('/api/courses', { data: { title: 'CSV Course', description: '' }, headers });
    if (resp.ok()) { course = await resp.json(); break; }
    await page.waitForTimeout(200);
  }
  expect(resp.ok()).toBeTruthy();

  // Visit teacher course detail page and click CSV link
  await page.goto(`/dashboard/teacher/${course.id}`);
  const link = page.getByRole('link', { name: /download csv/i });
  await expect(link).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    link.click()
  ]);
  const filename = download.suggestedFilename();
  expect(filename).toContain('interactive_attempts_');
  expect(filename).toContain(course.id);
});


