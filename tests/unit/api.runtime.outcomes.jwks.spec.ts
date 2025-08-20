import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';
import * as supa from '../helpers/supabaseMock';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('runtime outcomes JWKS verification', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, RUNTIME_API_V2: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('missing provider token -> 401 when jwks_url present', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: 'p1' }),
      course_providers: () => supa.supabaseOk({ jwks_url: 'https://jwks.example/jwks.json' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } }));
    expect(res.status).toBe(401);
  });

  test('invalid provider token -> 403', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: 'p1' }),
      course_providers: () => supa.supabaseOk({ jwks_url: 'https://jwks.example/jwks.json' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn<any, any>(global as any, 'import').mockImplementation((path: string) => {
      if (path.includes('jwksCache')) return Promise.resolve({ verifyJwtWithJwks: async () => { throw new Error('bad') } });
      return (jest.requireActual as any)(path);
    });
    const res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } }, { authorization: 'Bearer bad' }));
    expect([403]).toContain(res.status);
  });

  test('valid provider token (mocked) -> 201', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: 'p1' }),
      course_providers: () => supa.supabaseOk({ jwks_url: 'https://jwks.example/jwks.json' }),
      interactive_attempts: () => supa.supabaseOk({ id: 'ia1' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn<any, any>(global as any, 'import').mockImplementation((path: string) => {
      if (path.includes('jwksCache')) return Promise.resolve({ verifyJwtWithJwks: async () => ({ courseId: 'c1' }) });
      return (jest.requireActual as any)(path);
    });
    const res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'attempt.completed', score: 1, max: 1, passed: true } }, { authorization: 'Bearer good' }));
    expect([200,201]).toContain(res.status);
  });
});


