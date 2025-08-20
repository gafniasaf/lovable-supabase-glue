import { POST as ProvidersPOST } from '../../apps/web/src/app/api/providers/route';
import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function req(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/providers', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('providers POST negatives', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    (process.env as any).TEST_MODE = '1';
    // @ts-ignore simulate admin auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
  });

  test('rejects non-https jwks_url and domain', async () => {
    const supa = makeSupabaseMock({ course_providers: () => supabaseOk({ id: 'p1', name: 'x', jwks_url: 'https://x', domain: 'https://x' }) } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    const bad1 = await (ProvidersPOST as any)(req({ name: 'P', jwks_url: 'http://no', domain: 'https://ok' }));
    expect(bad1.status).toBe(400);
    const bad2 = await (ProvidersPOST as any)(req({ name: 'P', jwks_url: 'https://ok', domain: 'http://no' }));
    expect(bad2.status).toBe(400);
  });
});


