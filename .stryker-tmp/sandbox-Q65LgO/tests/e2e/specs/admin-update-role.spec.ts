// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('admin can update a user role (test-mode)', async ({ request, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const resp = await request.patch('/api/user/role', { data: { userId: '00000000-0000-0000-0000-000000000001', role: 'teacher' }, headers: { 'x-test-auth': 'admin' } });
  expect(resp.ok()).toBeTruthy();
});


