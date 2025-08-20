import { GET as ProvidersGET } from '../../apps/web/src/app/api/providers/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

describe('api.providers GET', () => {
  beforeEach(() => { jest.restoreAllMocks(); process.env.TEST_MODE = '1'; });

  test('requires auth', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue(null as any);
    const res = await (ProvidersGET as any)(new Request('http://localhost/api/providers') as any);
    expect(res.status).toBe(401);
  });

  test('returns list for authenticated user', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'teacher' } } as any);
    const providers = [{ id: '00000000-0000-0000-0000-000000000001', name: 'A', jwks_url: 'https://example.com/jwks.json', domain: 'https://example.com', created_at: new Date().toISOString() }];
    const supabase = makeSupabaseMock({ course_providers: ({}) => supabaseOk(providers) });
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(supabase as any);
    const res = await (ProvidersGET as any)(new Request('http://localhost/api/providers') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(1);
    expect(json[0].name).toBe('A');
  });
});


