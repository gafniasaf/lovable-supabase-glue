import { test, expect } from '@playwright/test';

test.describe('Contracts @contract', () => {
	test('health returns ok', async ({ request }) => {
		const res = await request.get('/api/health');
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json?.ok).toBe(true);
	});

	test('admin metrics is reachable', async ({ request }) => {
		const res = await request.get('/api/admin/metrics', { headers: { 'x-test-auth': 'admin' } as any });
		expect(res.ok()).toBeTruthy();
	});

	test('providers list works (admin)', async ({ request }) => {
		const res = await request.get('/api/providers', { headers: { 'x-test-auth': 'admin' } as any });
		expect(res.ok()).toBeTruthy();
	});

	test('student can read notification preferences', async ({ request }) => {
		const res = await request.get('/api/notifications/preferences', { headers: { 'x-test-auth': 'student' } as any });
		expect([200,204]).toContain(res.status());
	});
});


