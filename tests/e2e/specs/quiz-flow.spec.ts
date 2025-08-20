import { test, expect } from '@playwright/test';

test.describe('Quiz end-to-end', () => {
	test('teacher creates quiz; student answers and submits; teacher sees attempts', async ({ request }) => {
		await request.get('/api/test/seed?hard=1');

		// Create a course (teacher)
		const courseRes = await request.post('/api/courses', { headers: { 'x-test-auth': 'teacher' }, data: { title: 'Quiz Course', description: '' } });
		expect(courseRes.ok()).toBeTruthy();
		const course = await courseRes.json();

		// Create quiz
		const quizRes = await request.post('/api/quizzes', { headers: { 'x-test-auth': 'teacher' }, data: { course_id: course.id, title: 'Quick Quiz', time_limit_sec: 60 } });
		expect(quizRes.ok()).toBeTruthy();
		const quiz = await quizRes.json();

		// Add a question and choices
		const qRes = await request.post('/api/quiz-questions', { headers: { 'x-test-auth': 'teacher' }, data: { quiz_id: quiz.id, text: '2+2=?', order_index: 1 } });
		expect(qRes.ok()).toBeTruthy();
		const question = await qRes.json();
		const c1 = await request.post('/api/quiz-choices', { headers: { 'x-test-auth': 'teacher' }, data: { question_id: question.id, text: '3', correct: false, order_index: 1 } });
		expect(c1.ok()).toBeTruthy();
		const c2 = await request.post('/api/quiz-choices', { headers: { 'x-test-auth': 'teacher' }, data: { question_id: question.id, text: '4', correct: true, order_index: 2 } });
		expect(c2.ok()).toBeTruthy();

		// Student enrolls
		await request.post('/api/enrollments', { headers: { 'x-test-auth': 'student' }, data: { course_id: course.id } });

		// Start attempt
		const start = await request.post('/api/quiz-attempts', { headers: { 'x-test-auth': 'student' }, data: { quiz_id: quiz.id } });
		expect(start.ok()).toBeTruthy();
		const attempt = await start.json();

		// Answer the question (choose the correct choice text)
		// Choose the correct choice id via listing
		const choices = await (await request.get(`/api/quiz-choices?question_id=${question.id}`, { headers: { 'x-test-auth': 'student' } })).json();
		const correctId = (choices || []).find((x: any) => x.text === '4')?.id;
		await request.patch('/api/quiz-attempts', { headers: { 'x-test-auth': 'student' }, data: { attempt_id: attempt.id, question_id: question.id, choice_id: correctId } });

		// Submit
		const submit = await request.post('/api/quiz-attempts/submit', { headers: { 'x-test-auth': 'student' }, data: { attempt_id: attempt.id } });
		expect(submit.ok()).toBeTruthy();

		// Teacher lists attempts for quiz
		const list = await request.get(`/api/quiz-attempts?quiz_id=${quiz.id}`, { headers: { 'x-test-auth': 'teacher' } });
		expect(list.ok()).toBeTruthy();
	});
});


