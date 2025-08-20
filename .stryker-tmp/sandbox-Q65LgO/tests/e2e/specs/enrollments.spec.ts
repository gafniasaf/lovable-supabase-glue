// @ts-nocheck
import { test, expect } from '@playwright/test';

test('student can enroll in a course and list it (test-mode)', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const title = `Course ${Date.now()}`;
  const createRes = await request.post('/api/courses', { data: { title, description: 'E2E' }, headers: { 'x-test-auth': 'teacher' } });
  expect(createRes.ok()).toBeTruthy();
  const course = await createRes.json();

  // Switch to student role
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enrollRes = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enrollRes.ok()).toBeTruthy();

  const listRes = await request.get('/api/enrollments', { headers: { 'x-test-auth': 'student' } });
  expect(listRes.ok()).toBeTruthy();
  const rows = await listRes.json();
  expect(rows.map((r: any) => r.course_id)).toContain(course.id);
});

test('teacher cannot enroll', async ({ request, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const res = await request.post('/api/enrollments', { data: { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-000000000000' }, headers: { 'x-test-auth': 'teacher' } });
  expect(res.status()).toBe(403);
});


