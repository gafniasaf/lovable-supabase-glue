import { test, expect } from '@playwright/test';

test.describe('Quiz autosave + timer', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('autosaves selection and timer submits after expiry', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    const teachHeaders = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;
    const studHeaders = { 'content-type': 'application/json', 'x-test-auth': 'student' } as any;
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

    // Seed a course and quiz with 1 question
    const cRes = await request.post('/api/courses', { data: { title: 'QZ' }, headers: teachHeaders });
    const course = await cRes.json();
    const qzRes = await request.post('/api/quizzes', { data: { course_id: course.id, title: 'Quiz X' }, headers: teachHeaders });
    const quiz = await qzRes.json();
    const qRes = await request.post('/api/quiz-questions', { data: { quiz_id: quiz.id, text: '2+2=' }, headers: teachHeaders });
    const question = await qRes.json();
    const ch1 = await request.post('/api/quiz-choices', { data: { question_id: question.id, text: '4', correct: true }, headers: teachHeaders });
    const ch2 = await request.post('/api/quiz-choices', { data: { question_id: question.id, text: '5', correct: false }, headers: teachHeaders });

    await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    // Navigate and select correct choice
    await page.goto(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
    await expect(page.getByTestId('quiz-player')).toBeVisible();
    await page.getByTestId('quiz-choice').first().click();
    // Ensure autosave has time to fire before timer submit
    await page.waitForTimeout(300);
    // Wait for timer (set to 5s in page) and auto-submit
    await page.waitForTimeout(9000);
    await expect(page.getByTestId('quiz-score')).toBeVisible();
  });
});


