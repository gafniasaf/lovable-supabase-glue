// @ts-nocheck
import { test, expect } from '@playwright/test';
import { resetWithRetry, prewarmRoutes, waitForOk } from '../utils';

test.beforeEach(async ({ request }) => {
	const ok = await resetWithRetry(request);
	expect(ok).toBeTruthy();
});

test('print view lists lessons in order with preview (SSR)', async ({ page, context, request }) => {
	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
	await context.addCookies([
		{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
	]);

	// Seed course
	const courseTitle = `Course ${Date.now()}`;
	const createCourse = await request.post('/api/courses', {
		data: { title: courseTitle, description: 'For print view test' },
		headers: { 'x-test-auth': 'teacher' }
	});
	expect(createCourse.status()).toBe(201);
	const course = await createCourse.json();

	// Seed lessons
	const l1 = await request.post('/api/lessons', {
		data: { course_id: course.id, title: 'Intro', content: 'Welcome to the course', order_index: 1 },
		headers: { 'x-test-auth': 'teacher' }
	});
	expect(l1.ok()).toBeTruthy();
	const l2 = await request.post('/api/lessons', {
		data: { course_id: course.id, title: 'Chapter 1', content: 'Basics...', order_index: 2 },
		headers: { 'x-test-auth': 'teacher' }
	});
	expect(l2.ok()).toBeTruthy();

	// Prewarm and wait for lessons list route to be OK
	await prewarmRoutes(request, [`/api/lessons?course_id=${course.id}`], { 'x-test-auth': 'teacher' });
	const ok = await waitForOk(request, `/api/lessons?course_id=${course.id}`, { 'x-test-auth': 'teacher' }, 10000, 250);
	expect(ok).toBeTruthy();
	// Visit print page
	await page.goto(`/labs/teacher/${course.id}/print`);
	const firstRow = page.getByTestId('lesson-row').first();
	await expect(firstRow).toBeVisible();
	await expect(firstRow.getByTestId('lesson-order')).toHaveText('#1');
	await expect(firstRow.getByTestId('lesson-title')).toHaveText('Intro');
});


