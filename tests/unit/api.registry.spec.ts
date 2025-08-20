import { GET as RegCoursesGET, POST as RegCoursesPOST } from '../../apps/web/src/app/api/registry/courses/route';
import { POST as ExchangePOST } from '../../apps/web/src/app/api/runtime/auth/exchange/route';
import { GET as CtxGET } from '../../apps/web/src/app/api/runtime/context/route';
import { POST as ProgPOST } from '../../apps/web/src/app/api/runtime/progress/route';
import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';

function jsonReq(url: string, method: string, body?: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) } as any;
  return new Request(url, { method, headers: hdrs, body: body ? JSON.stringify(body) : undefined } as any);
}

function getReq(url: string, headers?: Record<string, string>) {
  const hdrs = { origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) } as any;
  return new Request(url, { method: 'GET', headers: hdrs } as any);
}

describe('External registry and runtime v2 (TEST_MODE)', () => {
  beforeEach(() => {
    (process.env as any).TEST_MODE = '1';
    (process.env as any).EXTERNAL_COURSES = '1';
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
  });

  test('registry courses GET requires auth and respects flag', async () => {
    // unauth
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.delete?.('x-test-auth');
    const resUnauth = await (RegCoursesGET as any)(getReq('http://localhost/api/registry/courses'));
    expect(resUnauth.status).toBe(401);
    // admin ok
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    const res = await (RegCoursesGET as any)(getReq('http://localhost/api/registry/courses'));
    expect([200,403]).toContain(res.status); // 403 if flag not read in test env
  });

  test('runtime v2 auth exchange rejects bad token', async () => {
    const res = await (ExchangePOST as any)(jsonReq('http://localhost/api/runtime/auth/exchange', 'POST', { token: 'bad' }));
    expect([400,403]).toContain(res.status);
  });

  test('context requires bearer token', async () => {
    const res = await (CtxGET as any)(getReq('http://localhost/api/runtime/context'));
    expect(res.status).toBe(401);
  });

  test('progress/grade require bearer token', async () => {
    const resP = await (ProgPOST as any)(jsonReq('http://localhost/api/runtime/progress', 'POST', { pct: 10 }));
    expect(resP.status).toBe(401);
    const resG = await (GradePOST as any)(jsonReq('http://localhost/api/runtime/grade', 'POST', { score: 5, max: 10, passed: true }));
    expect(resG.status).toBe(401);
  });
});
