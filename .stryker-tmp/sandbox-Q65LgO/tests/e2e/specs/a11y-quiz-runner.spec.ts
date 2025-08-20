// @ts-nocheck
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Quiz runner (serious/critical only)', async ({ request, page, context, baseURL }) => {
	await request.get('/api/test/seed?hard=1');

	const teacherHeaders = { 'x-test-auth': 'teacher' } as any;

	// Create course
	const courseRes = await request.post('/api/courses', { headers: teacherHeaders, data: { title: 'A11y Quiz Course', description: '' } });
	expect(courseRes.ok()).toBeTruthy();
	const course = await courseRes.json();

	// Create quiz
	const quizRes = await request.post('/api/quizzes', { headers: teacherHeaders, data: { course_id: course.id, title: 'A11y Quiz', time_limit_sec: 60 } });
	expect(quizRes.ok()).toBeTruthy();
	const quiz = await quizRes.json();

	// Add a question and choices
	const qRes = await request.post('/api/quiz-questions', { headers: teacherHeaders, data: { quiz_id: quiz.id, text: '2 + 2 = ?', order_index: 1 } });
	expect(qRes.ok()).toBeTruthy();
	const question = await qRes.json();
	const ch1 = await request.post('/api/quiz-choices', { headers: teacherHeaders, data: { question_id: question.id, text: '3', correct: false, order_index: 1 } });
	expect(ch1.ok()).toBeTruthy();
	const ch2 = await request.post('/api/quiz-choices', { headers: teacherHeaders, data: { question_id: question.id, text: '4', correct: true, order_index: 2 } });
	expect(ch2.ok()).toBeTruthy();

	// Enroll student and start attempt
	const studentHeaders = { 'x-test-auth': 'student' } as any;
	await request.post('/api/enrollments', { headers: studentHeaders, data: { course_id: course.id } });
	const startRes = await request.post('/api/quiz-attempts', { headers: studentHeaders, data: { quiz_id: quiz.id } });
	expect(startRes.ok()).toBeTruthy();

	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
	await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);

	await page.goto(`/dashboard/student/${course.id}/quizzes/${quiz.id}/play`);
	const results = await new AxeBuilder({ page }).include('main main').analyze();
	const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
	expect(serious).toEqual([]);
});


