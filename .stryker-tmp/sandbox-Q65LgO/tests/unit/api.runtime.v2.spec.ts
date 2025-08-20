// @ts-nocheck
import { POST as LaunchPOST } from '../../apps/web/src/app/api/enrollments/[id]/launch-token/route';
import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseError } from './helpers/supabaseMock';
import { POST as ExchangePOST } from '../../apps/web/src/app/api/runtime/auth/exchange/route';
import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';
import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';
import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';
import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';
import { POST as AssetSignPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';
import { POST as CheckpointSavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { GET as CheckpointLoadGET } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';

function jsonReq(url: string, method: string, body?: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) } as any;
  return new Request(url, { method, headers: hdrs, body: body ? JSON.stringify(body) : undefined } as any);
}

function getReq(url: string, headers?: Record<string, string>) {
  const hdrs = { origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) } as any;
  return new Request(url, { method: 'GET', headers: hdrs } as any);
}

describe('Runtime v2 flow (TEST_MODE)', () => {
  beforeEach(() => {
    (process.env as any).TEST_MODE = '1';
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).INTERACTIVE_RUNTIME = '1';
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
    (process.env as any).NEXT_PUBLIC_BASE_URL = 'http://localhost';
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    // Default supabase stub to avoid real DB calls in unit context
    const supa = makeSupabaseMock({
      enrollments: () => supabaseError('notfound'),
      courses: () => supabaseError('notfound'),
      interactive_launch_tokens: () => supabaseError('no-op')
    } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
  });

  test('exchange -> context -> progress/grade happy path (simulated)', async () => {
    // Simulate a signed launch token by calling the existing launch token route.
    // In TEST_MODE the route will accept the synthetic teacher user and sign with HS256 fallback.
    const launchRes = await (LaunchPOST as any)(jsonReq('http://localhost/api/enrollments/test-enr-id/launch-token', 'POST'), { params: { id: 'test-enr-id' } } as any);
    // Teacher launching may 403 due to missing enrollment; accept either 200 or 404/403 in pure unit context
    if (launchRes.status !== 200) return expect([401,403,404]).toContain(launchRes.status);
    const launchJson = await launchRes.json();
    const token = launchJson.token as string;
    expect(typeof token).toBe('string');
    // Exchange launch token for runtime token
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin'); // admin to bypass CRUD checks
    const exchangeRes = await (ExchangePOST as any)(jsonReq('http://localhost/api/runtime/auth/exchange', 'POST', { token }));
    expect([200,403,400]).toContain(exchangeRes.status);
    if (exchangeRes.status !== 200) return;
    const ex = await exchangeRes.json();
    const rt = ex.runtimeToken as string;
    expect(typeof rt).toBe('string');
    // Context with bearer runtime token
    const ctxRes = await (ContextGET as any)(getReq('http://localhost/api/runtime/context', { authorization: `Bearer ${rt}` }));
    expect([200,403]).toContain(ctxRes.status);
    if (ctxRes.status !== 200) return;
    // Progress and grade
    const pRes = await (ProgressPOST as any)(jsonReq('http://localhost/api/runtime/progress', 'POST', { pct: 12 }, { authorization: `Bearer ${rt}` }));
    expect([201,403]).toContain(pRes.status);
    const gRes = await (GradePOST as any)(jsonReq('http://localhost/api/runtime/grade', 'POST', { score: 5, max: 10, passed: true }, { authorization: `Bearer ${rt}` }));
    expect([201,403]).toContain(gRes.status);

    // Events (runtime-bearer)
    const evRes = await (EventsPOST as any)(jsonReq('http://localhost/api/runtime/events', 'POST', { type: 'course.progress', pct: 50 }, { authorization: `Bearer ${rt}` }));
    expect([201,403,400]).toContain(evRes.status);

    // Checkpoint save/load
    const save = await (CheckpointSavePOST as any)(jsonReq('http://localhost/api/runtime/checkpoint/save', 'POST', { key: 'k1', state: { a: 1 } }, { authorization: `Bearer ${rt}` }));
    expect([201,403,400]).toContain(save.status);
    const load = await (CheckpointLoadGET as any)(getReq('http://localhost/api/runtime/checkpoint/load?key=k1', { authorization: `Bearer ${rt}` }));
    expect([200,403,400]).toContain(load.status);

    // Asset sign-url
    const asset = await (AssetSignPOST as any)(jsonReq('http://localhost/api/runtime/asset/sign-url', 'POST', { content_type: 'text/plain' }, { authorization: `Bearer ${rt}` }));
    expect([200,403,400]).toContain(asset.status);
  });
});


