import { test, expect } from '@playwright/test';

test.describe('Security headers', () => {
  test('health responds with security headers', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const csp = res.headers()['content-security-policy'] || '';
    expect(csp).toContain("frame-ancestors 'none'");
    expect(res.headers()['x-frame-options']).toBe('DENY');
  });
});


