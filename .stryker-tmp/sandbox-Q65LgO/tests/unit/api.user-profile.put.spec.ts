// @ts-nocheck
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { PUT as ProfilePUT } from '../../apps/web/src/app/api/user/profile/route';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

const put = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/user/profile', { method: 'PUT', headers: { 'content-type': 'application/json', ...(headers||{}) }, body: JSON.stringify(body) });

describe('User profile PUT', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('updates allowed fields; unauth 401; validation 400', async () => {
    let res = await (ProfilePUT as any)(put({ display_name: 'x' }));
    expect(res.status).toBe(401);

    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', email: 'u@example.com', user_metadata: { role: 'teacher' } } as any);
    const mock = makeSupabaseMock({ profiles: ({ update, eq }) => supabaseOk({ id: eq?.id, ...update }) } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);

    res = await (ProfilePUT as any)(put({ display_name: 'D', avatar_url: 'http://x', preferences: { a: 1 } }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(200);

    const bad = await (ProfilePUT as any)(put({ display_name: 123 }, { 'x-test-auth': 'teacher' }));
    expect(bad.status).toBe(400);
  });
});


