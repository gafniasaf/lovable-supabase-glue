import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

describe('providers health API', () => {
  beforeEach(() => { jest.restoreAllMocks(); (process.env as any).TEST_MODE = '1'; });

  test('GET requires auth and admin', async () => {
    const mod = await import('../../apps/web/src/app/api/providers/health/route');
    let res = await (mod.GET as any)(new Request('http://localhost/api/providers/health?id=x'));
    expect(res.status).toBe(401);
    // auth as teacher -> 403
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (mod.GET as any)(new Request('http://localhost/api/providers/health?id=x'));
    expect(res.status).toBe(403);
  });

  test('GET returns ok in test-mode and echoes request-id', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    const supa = makeSupabaseMock({
      course_providers: ({}) => supabaseOk({ id: '11111111-1111-1111-1111-111111111111', name: 'p', jwks_url: 'https://example.com/.well-known/jwks.json', domain: 'https://example.com' })
    } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    const mod = await import('../../apps/web/src/app/api/providers/health/route');
    const req = new Request('http://localhost/api/providers/health?id=11111111-1111-1111-1111-111111111111', { headers: { 'x-request-id': 'rid-1' } });
    const res = await (mod.GET as any)(req);
    expect(res.ok).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBe('rid-1');
    const body = await res.json();
    expect(body.jwks.ok).toBe(true);
    expect(body.domainCheck.ok).toBe(true);
  });
});


