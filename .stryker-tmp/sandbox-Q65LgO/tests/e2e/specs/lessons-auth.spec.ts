// @ts-nocheck
import { test, expect } from '@playwright/test';

test('cannot create lesson when unauthenticated', async ({ request }) => {
  const res = await request.post('/api/lessons', { data: { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000000', title: 'Valid title', content: '', order_index: 1 } });
  expect(res.status()).toBe(401);
});

test('student cannot create lesson', async ({ request, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const res = await request.post('/api/lessons', { data: { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000000', title: 'Valid title', content: '', order_index: 1 }, headers: { 'x-test-auth': 'student' } });
  expect(res.status()).toBe(403);
});


