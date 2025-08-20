// @ts-nocheck
import { test, expect } from '@playwright/test';
import { resetWithRetry, prewarmRoutes, waitForOk } from '../utils';

test.beforeEach(async ({ request }) => {
	const ok = await resetWithRetry(request);
	expect(ok).toBeTruthy();
});

test('teacher lessons print summary shows ordered lessons with preview', async ({ request, page, context }) => {
	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
	await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

	// Create course
	let resp = await request.post('/api/courses', { data: { title: 'Print Course' }, headers: { 'x-test-auth': 'teacher' } });
	expect(resp.ok()).toBeTruthy();
	const course = await resp.json();

	// Create lessons (titles must be at least 3 chars per schema)
	resp = await request.post('/api/lessons', { data: { course_id: course.id, title: 'L01', content: 'Content A', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
	expect(resp.ok()).toBeTruthy();
	resp = await request.post('/api/lessons', { data: { course_id: course.id, title: 'L02', content: 'Content B', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
	expect(resp.ok()).toBeTruthy();

	await prewarmRoutes(request, [`/api/lessons?course_id=${course.id}`], { 'x-test-auth': 'teacher' });
	const ok = await waitForOk(request, `/api/lessons?course_id=${course.id}`, { 'x-test-auth': 'teacher' }, 10000, 250);
	expect(ok).toBeTruthy();
	await page.goto(`/labs/teacher/${course.id}/lessons-print-summary`);
	const list = page.getByTestId('print-lessons');
	await expect(list).toBeVisible();
	const firstRow = page.getByTestId('print-lesson-row').first();
	await expect(firstRow.getByTestId('lesson-order')).toHaveText('#1');
	await expect(firstRow.getByTestId('lesson-title')).toHaveText('L01');
	await expect(firstRow.getByTestId('lesson-preview')).toContainText('Content');
});


