import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';
import * as supa from '../helpers/supabaseMock';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 30_000 })
}), { virtual: true });

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime outcomes rate-limit headers', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, RUNTIME_API_V2: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('429 includes retry-after and rate-limit headers', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: 'p1' }),
      course_providers: () => supa.supabaseOk({ jwks_url: 'https://jwks.example/jwks.json' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    // Mock jwks verification success to focus on rate-limit behavior
    jest.spyOn<any, any>(global as any, 'import').mockImplementation((path: string) => {
      if (path.includes('jwksCache')) return Promise.resolve({ verifyJwtWithJwks: async () => ({ courseId: 'c1' }) });
      return (jest.requireActual as any)(path);
    });
    const res = await (OutcomesPOST as any)(post('http://localhost/api/runtime/outcomes', { courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } }, { authorization: 'Bearer good' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


