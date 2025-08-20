import { test, expect } from '@playwright/test';

test.describe('Student quiz history', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('shows latest quiz score when submitted', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    // Teacher seeds course and quiz
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const teachHeaders = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;
    let resp = await request.post('/api/courses', { data: { title: 'Course H' }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();
    const course = await resp.json();
    resp = await request.post('/api/quizzes', { data: { course_id: course.id, title: 'Quiz H', points: 100 }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();
    const quiz = await resp.json();

    // Create a question and a correct choice
    resp = await request.post('/api/quiz-questions', { data: { quiz_id: quiz.id, text: '2+2?', order_index: 1 }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();
    const q = await resp.json();
    resp = await request.post('/api/quiz-choices', { data: { question_id: q.id, text: '4', correct: true, order_index: 1 }, headers: teachHeaders });
    expect(resp.ok()).toBeTruthy();

    // Student enrolls and takes quiz
    await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const studHeaders = { 'content-type': 'application/json', 'x-test-auth': 'student' } as any;
    resp = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: studHeaders });
    expect(resp.ok()).toBeTruthy();
    // Start attempt
    let at = await request.post('/api/quiz-attempts', { data: { quiz_id: quiz.id }, headers: studHeaders });
    expect(at.ok()).toBeTruthy();
    const attempt = await at.json();
    // Answer correctly
    let ans = await request.patch('/api/quiz-attempts', { data: { attempt_id: attempt.id, question_id: q.id, choice_id: (await (await request.get(`/api/quiz-choices?question_id=${q.id}`, { headers: studHeaders })).json())[0].id }, headers: studHeaders });
    expect(ans.ok()).toBeTruthy();
    // Submit
    let sub = await request.post('/api/quiz-attempts/submit', { data: { attempt_id: attempt.id }, headers: studHeaders });
    expect(sub.ok()).toBeTruthy();

    // Visit history page
    await page.goto(`/dashboard/student/${course.id}/quizzes/history`);
    await expect(page.getByTestId('quiz-history-list')).toBeVisible();
    await expect(page.getByTestId('history-row')).toHaveCount(1);
    await expect(page.getByTestId('history-quiz-title')).toHaveText('Quiz H');
    await expect(page.getByTestId('history-score')).not.toHaveText('-');
  });
});


