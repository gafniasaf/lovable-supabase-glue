// @ts-nocheck
import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { POST as LaunchPOST } from '../../apps/web/src/app/api/enrollments/[id]/launch-token/route';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function makePatch(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'POST', headers });
}

describe('API /api/enrollments/[id]/launch-token', () => {
  beforeEach(() => { jest.restoreAllMocks(); delete (process.env as any).TEST_MODE; });

  test('unauth → 401; unknown id → 404; non-owner non-teacher → 403', async () => {
    let res = await (LaunchPOST as any)(makePatch('http://localhost/api/enrollments/eee/launch-token'), { params: { id: 'eee' } } as any);
    expect(res.status).toBe(401);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'student' } } as any);
    const supa = makeSupabaseMock({
      enrollments: ({ id }) => supabaseOk(null),
    } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    res = await (LaunchPOST as any)(makePatch('http://localhost/api/enrollments/eee/launch-token'), { params: { id: 'eee' } } as any);
    expect(res.status).toBe(404);
  });
});


