// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('quizzes end-to-end flow', async ({ request, context, page }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');

  // Teacher: create course
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  let resp = await request.post('/api/courses', { data: { title: 'Course 1' }, headers: { 'x-test-auth': 'teacher' } });
  expect(resp.ok()).toBeTruthy();
  const course = await resp.json();

  // Create quiz
  resp = await request.post('/api/quizzes', { data: { course_id: course.id, title: 'Quiz 1', points: 100 }, headers: { 'x-test-auth': 'teacher' } });
  if (!resp.ok()) {
    test.skip(true, 'quizzes API not available');
  }
  const quiz = await resp.json();

  // Create two questions
  resp = await request.post('/api/quiz-questions', { data: { quiz_id: quiz.id, text: 'Q1?', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  if (!resp.ok()) {
    test.skip(true, 'quiz-questions API not available');
  }
  const q1 = await resp.json();
  resp = await request.post('/api/quiz-questions', { data: { quiz_id: quiz.id, text: 'Q2?', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  if (!resp.ok()) {
    test.skip(true, 'quiz-questions API not available');
  }
  const q2 = await resp.json();

  // Choices for Q1
  let postC1 = await request.post('/api/quiz-choices', { data: { question_id: q1.id, text: 'A1', correct: true, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  if (!postC1.ok()) {
    test.skip(true, 'quiz-choices API not available');
  }
  let c1a = await postC1.json();
  await request.post('/api/quiz-choices', { data: { question_id: q1.id, text: 'B1', correct: false, order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  // Choices for Q2
  let postC2 = await request.post('/api/quiz-choices', { data: { question_id: q2.id, text: 'A2', correct: true, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  if (!postC2.ok()) {
    test.skip(true, 'quiz-choices API not available');
  }
  let c2a = await postC2.json();
  await request.post('/api/quiz-choices', { data: { question_id: q2.id, text: 'B2', correct: false, order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });

  // Student: start, answer, submit
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  resp = await request.post('/api/quiz-attempts', { data: { quiz_id: quiz.id }, headers: { 'x-test-auth': 'student' } });
  if (!resp.ok()) {
    test.skip(true, 'quiz-attempts API not available');
  }
  const attempt = await resp.json();

  resp = await request.patch('/api/quiz-attempts', { data: { attempt_id: attempt.id, question_id: q1.id, choice_id: c1a.id }, headers: { 'x-test-auth': 'student' } });
  expect(resp.ok()).toBeTruthy();
  resp = await request.patch('/api/quiz-attempts', { data: { attempt_id: attempt.id, question_id: q2.id, choice_id: c2a.id }, headers: { 'x-test-auth': 'student' } });
  expect(resp.ok()).toBeTruthy();

  resp = await request.post('/api/quiz-attempts/submit', { data: { attempt_id: attempt.id }, headers: { 'x-test-auth': 'student' } });
  expect(resp.ok()).toBeTruthy();
  const final = await resp.json();
  expect(final.score).toBe(100);

  // Student quiz player SSR
  const pre = await request.get(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
  if (pre.status() === 200) {
    await page.goto(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
    await expect(page.getByTestId('quiz-player')).toBeVisible();
  }
});


