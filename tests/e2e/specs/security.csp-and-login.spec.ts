import { test, expect } from '@playwright/test';

const SUPABASE_URL = process.env.PLAYWRIGHT_SUPABASE_URL || '';
const SUPABASE_HOST = (() => { try { return SUPABASE_URL ? new URL(SUPABASE_URL).host : ''; } catch { return ''; } })();

test.describe('Security gates: CSP and Supabase login', () => {
  test('CSP header allows self and supabase', async ({ request, baseURL }) => {
    const res = await request.get(`${baseURL}/login`);
    expect(res.ok()).toBeTruthy();
    const csp = res.headers()['content-security-policy'] || res.headers()['Content-Security-Policy'] || '';
    expect(csp, 'CSP must include connect-src self').toContain("connect-src 'self'");
    // When SUPABASE_HOST is provided via CI secret/variable, assert it; otherwise assert any supabase host allowance
    if (SUPABASE_HOST) {
      expect(csp, `CSP must allow ${SUPABASE_HOST}`).toContain(SUPABASE_HOST);
    } else {
      expect(/supabase\.co/.test(csp)).toBeTruthy();
    }
  });

  test('Login triggers token request with valid apikey header (no newlines) and correct host', async ({ page, baseURL }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });

    const tokenReqPromise = page.waitForRequest((req) => req.url().includes('/auth/v1/token?grant_type=password'), { timeout: 15000 }).catch(() => null);

    await page.fill('input[type="email"]', process.env.PLAYWRIGHT_LOGIN_EMAIL || 'admin@expertcollege.com');
    await page.fill('input[type="password"]', process.env.PLAYWRIGHT_LOGIN_PASSWORD || 'TempPass!234');
    await page.getByRole('button', { name: /sign in/i }).click();

    const tokenReq = await tokenReqPromise;
    expect(tokenReq, 'Supabase token request should be issued').not.toBeNull();
    const url = new URL(tokenReq!.url());
    expect(url.host.endsWith('supabase.co')).toBeTruthy();
    const apikey = tokenReq!.headers()['apikey'];
    expect(apikey && apikey.length > 10).toBeTruthy();
    expect(/[\r\n]/.test(apikey || ''), 'Anon key must not contain CR/LF').toBeFalsy();

    const badConsole = consoleErrors.filter((m) => /Content Security Policy|Refused to connect|Minified React error/.test(m));
    expect(badConsole, `No CSP/refused/React-errors in console:\n${badConsole.join('\n')}`).toHaveLength(0);
  });

  test('Env sanity (skipped if not provided)', async () => {
    test.skip(!process.env.PLAYWRIGHT_SUPABASE_URL || !process.env.PLAYWRIGHT_SUPABASE_ANON_KEY, 'SUPABASE envs not provided to CI');
    expect(process.env.PLAYWRIGHT_SUPABASE_URL).toMatch(/^https:\/\/.*supabase\.co$/);
    const k = process.env.PLAYWRIGHT_SUPABASE_ANON_KEY || '';
    expect(k.length).toBeGreaterThan(20);
    expect(/[\r\n]/.test(k)).toBeFalsy();
  });
});


