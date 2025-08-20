// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Assignments and grading', () => {
	test('teacher creates assignment, student submits, teacher grades', async ({ request }) => {
		await request.get('/api/test/seed?hard=1');

		// Create a course first (teacher)
		const courseRes = await request.post('/api/courses', { headers: { 'x-test-auth': 'teacher' }, data: { title: 'Grading Course', description: '' } });
		expect(courseRes.ok()).toBeTruthy();
		const course = await courseRes.json();

		// Assignment
		const assignRes = await request.post('/api/assignments', { headers: { 'x-test-auth': 'teacher' }, data: { course_id: course.id, title: 'Essay 1', description: 'Write 200 words' } });
		expect(assignRes.ok()).toBeTruthy();
		const assignment = await assignRes.json();

		// Student enrolls and submits
		await request.post('/api/enrollments', { headers: { 'x-test-auth': 'student' }, data: { course_id: course.id } });
		const subRes = await request.post('/api/submissions', { headers: { 'x-test-auth': 'student' }, data: { assignment_id: assignment.id, text: 'My essay' } });
		expect(subRes.ok()).toBeTruthy();
		const submission = await subRes.json();

		// Teacher grades
		const gradeRes = await request.patch(`/api/submissions?id=${submission.id}`, { headers: { 'x-test-auth': 'teacher' }, data: { score: 88, feedback: 'Well done' } });
		expect(gradeRes.ok()).toBeTruthy();
	});
});


