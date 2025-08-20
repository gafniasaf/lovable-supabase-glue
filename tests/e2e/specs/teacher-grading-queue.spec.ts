import { test, expect } from '@playwright/test';

test('teacher grading queue paginates and returns x-total-count', async ({ request, context, baseURL, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
  const res = await request.get('/api/teacher/grading-queue?page=1&limit=5', { headers: { 'x-test-auth': 'teacher' } as any });
  expect(res.ok()).toBeTruthy();
  const total = res.headers()['x-total-count'] || res.headers()['X-Total-Count'];
  expect(total).not.toBeUndefined();
  const json = await res.json();
  expect(Array.isArray(json)).toBeTruthy();
});


