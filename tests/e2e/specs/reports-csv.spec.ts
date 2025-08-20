import { test, expect } from '@playwright/test';

test('reports CSV export returns text/csv', async ({ request, context, baseURL, page }) => {
  // Skip if runtime v2 not enabled
  if (!process.env.RUNTIME_API_V2) {
    test.skip();
  }
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
  // Create a course to scope report
  const headers = { 'x-test-auth': 'teacher' } as any;
  let c: any, course: any;
  for (let i = 0; i < 10; i++) {
    c = await request.post('/api/courses', { data: { title: 'R', description: '' }, headers });
    if (c.ok()) { course = await c.json(); break; }
    await (page as any)?.waitForTimeout?.(200);
  }
  expect(c.ok()).toBeTruthy();
  let res: any;
  for (let i = 0; i < 10; i++) {
    res = await request.get(`/api/runtime/outcomes/export?course_id=${course.id}`, { headers });
    if (res.ok()) break;
    await (page as any)?.waitForTimeout?.(200);
  }
  expect(res.ok()).toBeTruthy();
  expect(res.headers()['content-type'] || res.headers()['Content-Type']).toContain('text/csv');
  const text = await res.text();
  expect(text.length).toBeGreaterThan(0);
});


