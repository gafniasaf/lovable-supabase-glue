import { test, expect } from '@playwright/test';

test.describe('Profile + Notifications', () => {
	test('update profile fields and read/patch notifications', async ({ page, request }) => {
		await request.get('/api/test/seed?hard=1');

		// Update profile for teacher
		const put = await request.put('/api/user/profile', {
			headers: { 'x-test-auth': 'teacher', 'content-type': 'application/json' },
			data: { display_name: 'E2E Teacher', bio: 'Automated test' }
		});
		expect(put.ok()).toBeTruthy();

		// Read notifications as student
		const list = await request.get('/api/notifications', { headers: { 'x-test-auth': 'student' } });
		expect(list.ok()).toBeTruthy();
		const rows: any[] = await list.json();
		if (rows.length > 0) {
			const first = rows[0];
			const patch = await request.patch(`/api/notifications?id=${first.id}`, { headers: { 'x-test-auth': 'student' }, data: { read: true } });
			expect(patch.ok()).toBeTruthy();
		}

		// UI check: profile page renders for teacher
		await page.context().addCookies([{ name: 'x-test-auth', value: 'teacher', domain: 'localhost', path: '/' }]);
		await page.goto('/dashboard/teacher/profile');
		await expect(page.getByText('Teacher profile')).toBeVisible();
	});
});


