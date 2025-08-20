// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Teacher manage quiz view', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('renders questions and choices', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const headers = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;

    // Seed course, quiz, question, choice
    let resp = await request.post('/api/courses', { data: { title: 'Course Q' }, headers });
    expect(resp.ok()).toBeTruthy();
    const course = await resp.json();
    resp = await request.post('/api/quizzes', { data: { course_id: course.id, title: 'Quiz M', points: 100 }, headers });
    expect(resp.ok()).toBeTruthy();
    const quiz = await resp.json();
    resp = await request.post('/api/quiz-questions', { data: { quiz_id: quiz.id, text: 'What is 1+1?', order_index: 1 }, headers });
    expect(resp.ok()).toBeTruthy();
    const q = await resp.json();
    resp = await request.post('/api/quiz-choices', { data: { question_id: q.id, text: '2', correct: true, order_index: 1 }, headers });
    expect(resp.ok()).toBeTruthy();

    // Ensure API returns the seeded question before visiting
    let getQ = await request.get(`/api/quiz-questions?quiz_id=${quiz.id}`, { headers });
    expect(getQ.ok()).toBeTruthy();
    const qs = await getQ.json();
    expect(qs.length).toBeGreaterThan(0);

    // Visit manage view (avoid waiting for full load to reduce dev HMR flake)
    await page.goto(`/dashboard/teacher/${course.id}/quizzes/${quiz.id}/manage`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('questions-list')).toBeVisible();
    await expect(page.getByTestId('question-row')).toHaveCount(1);
    await expect(page.getByTestId('choices-list')).toBeVisible();
    await expect(page.getByTestId('choice-row')).toHaveCount(1);
  });
});


