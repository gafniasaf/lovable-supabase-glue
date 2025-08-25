import { test, expect } from '@playwright/test';

test.describe('Teacher course authoring', () => {
	test('create course, add lesson, student enrolls and marks complete', async ({ page, request, baseURL, context }) => {
		// Seed/reset to a clean state
		await request.get('/api/test/seed?hard=1');

		// Create course as teacher
		const createCourse = await request.post('/api/courses', {
			headers: { 'x-test-auth': 'teacher' },
			data: { title: 'E2E Created Course', description: 'e2e' }
		});
		expect(createCourse.ok()).toBeTruthy();
		const course = await createCourse.json();
		expect(course?.id).toBeTruthy();

		// Add a lesson
		const createLesson = await request.post('/api/lessons', {
			headers: { 'x-test-auth': 'teacher' },
			data: { course_id: course.id, title: 'E2E Lesson 1', content: 'body', order_index: 1 }
		});
		expect(createLesson.ok()).toBeTruthy();
		const lesson = await createLesson.json();
		expect(lesson?.id).toBeTruthy();

		// Enroll student
		const enroll = await request.post('/api/enrollments', {
			headers: { 'x-test-auth': 'student' },
			data: { course_id: course.id }
		});
		expect(enroll.ok()).toBeTruthy();

		// Student marks lesson complete
		const mark = await request.post('/api/lessons/complete', {
			headers: { 'x-test-auth': 'student' },
			data: { lessonId: lesson.id }
		});
		expect(mark.ok()).toBeTruthy();

		// UI spot-checks: navigate to course detail which avoids SSR-relative fetches
		const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
		await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/' }] as any);
		await page.goto(`/dashboard/teacher/${course.id}`);
		await expect(page.getByRole('heading', { name: /E2E Created Course/ })).toBeVisible();
	});
});


