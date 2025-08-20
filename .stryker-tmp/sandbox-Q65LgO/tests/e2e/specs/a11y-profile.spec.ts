// @ts-nocheck
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11y: Student profile page (serious/critical only)', async ({ page, context, baseURL }) => {
	const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
	await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
	await page.goto('/dashboard/student/profile');
	const results = await new AxeBuilder({ page }).include('main main').analyze();
	const serious = (results.violations || []).filter(v => v.impact === 'serious' || v.impact === 'critical');
	expect(serious).toEqual([]);
});


