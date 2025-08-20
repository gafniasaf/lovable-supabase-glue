// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Labs - Student Profile', () => {
	test.beforeEach(async ({ request }) => {
		const reset = await request.post('/api/test/reset');
		expect(reset.ok()).toBeTruthy();
	});

	test('unauthenticated user sees sign-in prompt', async ({ page }) => {
		await page.goto('/labs/student/profile');
		await expect(page.getByTestId('signin-prompt')).toBeVisible();
		await expect(page.getByTestId('signin-link')).toBeVisible();
	});

	test('student can see profile email and role', async ({ page, context }) => {
		const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
		await context.addCookies([
			{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }
		]);
		await page.goto('/labs/student/profile');
		await expect(page.getByTestId('profile-role')).toHaveText('student');
		await expect(page.getByTestId('profile-email')).toContainText('@');
	});
});


