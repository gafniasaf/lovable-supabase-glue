import { test, expect } from '@playwright/test';

test.describe('CSP nonce wiring', () => {
  test('inline scripts carry CSP nonce and no unsafe-inline in CSP', async ({ page }) => {
    const res = await page.request.get('/');
    expect(res.ok()).toBeTruthy();
    const csp = res.headers()['content-security-policy'] || '';
    expect(csp).toBeTruthy();
    expect(csp.includes("'unsafe-inline'")).toBeFalsy();
    await page.goto('/');
    const nonce = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="next-head-count"]');
      const scripts = Array.from(document.querySelectorAll('script'));
      const withNonce = scripts.find(s => s.nonce && s.nonce.length > 0);
      return withNonce ? withNonce.nonce : '';
    });
    expect(nonce).toBeTruthy();
  });
});


