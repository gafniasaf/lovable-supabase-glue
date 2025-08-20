// @ts-nocheck
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Teacher assignment submissions view (serious/critical only)', async ({ request, page, context, baseURL }) => {
	await request.get('/api/test/seed?hard=1');
	const teacherHeaders = { 'x-test-auth': 'teacher' } as any;

	// Create course
	const courseRes = await request.post('/api/courses', { headers: teacherHeaders, data: { title: 'A11y Assign', description: '' } });
	expect(courseRes.ok()).toBeTruthy();
	const course = await courseRes.json();

	// Create assignment
	const assignmentRes = await request.post('/api/assignments', { headers: teacherHeaders, data: { course_id: course.id, title: 'A11y Assignment', description: '' } });
	expect(assignmentRes.ok()).toBeTruthy();
	const assignment = await assignmentRes.json();

	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
	await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
	await page.goto(`/dashboard/teacher/${course.id}/assignments/${assignment.id}/submissions`);
	const results = await new AxeBuilder({ page }).include('main main').analyze();
	const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
	expect(serious).toEqual([]);
});


