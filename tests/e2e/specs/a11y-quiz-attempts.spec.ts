import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Teacher quiz attempts page (serious/critical only)', async ({ request, context, page, baseURL }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  const headers = { 'x-test-auth': 'teacher' } as any;
  const courseRes = await request.post('/api/courses', { headers, data: { title: 'A11y Quiz Attempts', description: '' } });
  expect(courseRes.ok()).toBeTruthy();
  const course = await courseRes.json();
  const quizRes = await request.post('/api/quizzes', { headers, data: { course_id: course.id, title: 'Q', points: 100 } });
  expect(quizRes.ok()).toBeTruthy();
  const quiz = await quizRes.json();
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto(`/dashboard/teacher/${course.id}/quizzes/${quiz.id}/attempts`);
  const results = await new AxeBuilder({ page }).include('main').analyze();
  const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
});


