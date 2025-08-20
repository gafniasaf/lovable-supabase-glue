import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Course admin page (serious/critical only)', async ({ request, page, context, baseURL }) => {
	await request.get('/api/test/seed?hard=1');
	const headers = { 'x-test-auth': 'teacher' } as any;
	const createCourse = await request.post('/api/courses', { headers, data: { title: 'A11y Course', description: '' } });
	expect(createCourse.ok()).toBeTruthy();
	const course = await createCourse.json();

	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
	await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
	await page.goto(`/dashboard/teacher/${course.id}`);
	const results = await new AxeBuilder({ page }).include('main').analyze();
	const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
	expect(serious).toEqual([]);
});


