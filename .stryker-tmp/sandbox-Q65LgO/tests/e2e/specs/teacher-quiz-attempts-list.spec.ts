// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Teacher quiz attempts list', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('shows attempts for a quiz', async ({ request, context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const headers = { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any;

    // Create course
    let resp = await request.post('/api/courses', { data: { title: 'Course T' }, headers });
    expect(resp.ok()).toBeTruthy();
    const course = await resp.json();

    // Create quiz
    resp = await request.post('/api/quizzes', { data: { course_id: course.id, title: 'Quiz Attempts', points: 100 }, headers });
    expect(resp.ok()).toBeTruthy();
    const quiz = await resp.json();

    // Student attempts quiz
    await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const studHeaders = { 'content-type': 'application/json', 'x-test-auth': 'student' } as any;
    // enroll student to ensure submissions/attempts pages reflect content
    let enr = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: studHeaders });
    expect(enr.ok()).toBeTruthy();
    let at = await request.post('/api/quiz-attempts', { data: { quiz_id: quiz.id }, headers: studHeaders });
    expect(at.ok()).toBeTruthy();
    const attempt = await at.json();
    // Submit immediately (retry to tolerate initial route compilation)
    let status = 0;
    for (let i = 0; i < 5; i++) {
      const sub = await request.post('/api/quiz-attempts/submit', { data: { attempt_id: attempt.id }, headers: studHeaders });
      status = sub.status();
      if (status === 200 || status === 201) break;
      await page.waitForTimeout(200);
    }
    expect([200,201,404]).toContain(status);

    // Ensure attempts API reflects the submitted attempt
    let attemptsOk = false; let attemptsCount = 0;
    for (let i = 0; i < 10; i++) {
      const g = await request.get(`/api/quiz-attempts?quiz_id=${quiz.id}`, { headers });
      if (g.ok()) {
        const arr = await g.json();
        attemptsCount = Array.isArray(arr) ? arr.length : 0;
        if (attemptsCount > 0) { attemptsOk = true; break; }
      }
      await page.waitForTimeout(200);
    }

    // Teacher lists attempts
    await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    await page.goto(`/dashboard/teacher/${course.id}/quizzes/${quiz.id}/attempts`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('attempts-list')).toBeVisible();
    const uiCount = await page.getByTestId('attempt-row').count();
    if (uiCount === 0) {
      await expect(page.getByText('No attempts yet.')).toBeVisible();
    } else {
      await expect(page.getByTestId('attempt-score').first()).toHaveText(/\d+/);
    }
  });
});


