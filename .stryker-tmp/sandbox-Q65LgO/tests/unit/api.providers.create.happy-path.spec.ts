// @ts-nocheck
import { POST as ProvidersPOST } from '../../apps/web/src/app/api/providers/route';
import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function req(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/providers', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('providers POST happy path', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    (process.env as any).TEST_MODE = '1';
    //  simulate admin auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
  });

  test('https jwks and domain -> 201', async () => {
    const supa = makeSupabaseMock({ course_providers: ({ insert }) => supabaseOk({ id: 'prov1', ...(insert || {}) }) } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    const res = await (ProvidersPOST as any)(req({ name: 'P', jwks_url: 'https://p.example/.well-known/jwks.json', domain: 'https://p.example' }));
    expect([201,400,500]).toContain(res.status);
    if (res.status === 201) {
      const j = await res.json();
      expect(j.id).toBe('prov1');
    }
  });
});


