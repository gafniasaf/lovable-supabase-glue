import { PATCH as RolePATCH } from '../../apps/web/src/app/api/user/role/route';
import * as supa from '../helpers/supabaseMock';

const patch = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/user/role', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('user role PATCH audit log', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('admin role update writes audit_logs entry', async () => {
    // Admin caller
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'admin-1', user_metadata: { role: 'admin' } } as any);
    const insertSpy = jest.fn(() => supa.supabaseOk({ ok: true }));
    const mock = (supa as any).makeSupabaseMock({ audit_logs: insertSpy } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const res = await (RolePATCH as any)(patch({ userId: 'u1', role: 'teacher' }));
    expect([200,403,401]).toContain(res.status);
    // Verify audit insert attempted
    expect(insertSpy).toHaveBeenCalled();
  });
});


