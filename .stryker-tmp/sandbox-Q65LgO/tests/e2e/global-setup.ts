// @ts-nocheck
import { request as pwRequest, FullConfig } from '@playwright/test';

async function waitForHealth(baseURL: string, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ctx = await pwRequest.newContext({ baseURL });
      const res = await ctx.get('/api/health');
      await ctx.dispose();
      if (res.ok()) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('Health check timeout');
}

export default async function globalSetup(_: FullConfig) {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030';
  await waitForHealth(baseURL);
  // Pre-warm the app shell to reduce Next.js dev overlay during first route loads
  try {
    const warm = await pwRequest.newContext({ baseURL });
    const start = Date.now();
    while (Date.now() - start < 60000) {
      const resp = await warm.get('/');
      const txt = await resp.text();
      if (resp.ok() && txt.includes('home-title')) break;
      await new Promise(r => setTimeout(r, 500));
    }
    await warm.dispose();
  } catch {}
  // Pre-compile common API routes to avoid first-hit compile during specs
  try {
    const warmAuth = await pwRequest.newContext({ baseURL, extraHTTPHeaders: { 'x-test-auth': 'teacher' } });
    await warmAuth.get('/api/courses').catch(() => {});
    await warmAuth.get('/api/lessons?course_id=00000000-0000-0000-0000-000000000000').catch(() => {});
    await warmAuth.dispose();
  } catch {}
  const request = await pwRequest.newContext({ baseURL, extraHTTPHeaders: { 'x-test-auth': process.env.PW_TEST_AUTH || '' } });
  // Prefer the stable reset endpoint; keep retrying while dev server compiles routes
  async function tryResetOnce(path: string) {
    try {
      const r = await request.post(path);
      return r;
    } catch {
      return await request.post(path).catch(() => ({ ok: () => false, status: () => 0, text: async () => '' } as any));
    }
  }
  async function resetWithTimeout(timeoutMs = 60000): Promise<Response> {
    const start = Date.now();
    const paths = ['/api/test/reset', '/api/__test__/reset'];
    let last: any = null;
    while (Date.now() - start < timeoutMs) {
      for (const p of paths) {
        const resp = await tryResetOnce(p);
        last = resp;
        if (resp.ok()) return resp as Response;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    return last as Response;
  }
  const resp = await resetWithTimeout();
  if (!resp.ok()) {
    const body = await resp.text();
    // In Next dev, API routes may transiently return a 404 HTML overlay while compiling.
    // Most specs perform their own per-test reset, so we warn and proceed instead of failing.
    // eslint-disable-next-line no-console
    console.warn(`Global reset non-OK (${resp.status()}), proceeding anyway. Body: ${body?.slice?.(0, 200) || ''}`);
  }
  await request.dispose();
}


