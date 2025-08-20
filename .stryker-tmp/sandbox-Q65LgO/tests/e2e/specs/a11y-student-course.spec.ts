// @ts-nocheck
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Student course page (serious/critical only)', async ({ request, context, page, baseURL }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  // Seed minimal: teacher creates course and lesson, student enrolls
  const t = { 'x-test-auth': 'teacher' } as any;
  const create = await request.post('/api/courses', { headers: t, data: { title: 'A11y Course', description: '' } });
  expect(create.ok()).toBeTruthy();
  const course = await create.json();
  await request.post('/api/lessons', { headers: t, data: { course_id: course.id, title: 'L1', content: '', order_index: 1 } });
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await request.post('/api/enrollments', { headers: { 'x-test-auth': 'student' } as any, data: { course_id: course.id } });
  await page.goto(`/dashboard/student/${course.id}`);
  const results = await new AxeBuilder({ page }).include('main main').analyze();
  const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
});


