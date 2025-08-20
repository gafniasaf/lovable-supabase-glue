import * as supa from '../../apps/web/src/lib/supabaseServer';
import { GET as AuditGET } from '../../apps/web/src/app/api/admin/audit-logs/route';
import { makeSupabaseMock, supabaseOk, supabaseError } from './helpers/supabaseMock';

const get = (url: string, headers?: Record<string, string>) => new Request(url, { method: 'GET', headers });

describe('Admin audit logs API', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('401 unauthenticated; 403 non-admin; 200 admin', async () => {
    let res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs'));
    expect(res.status).toBe(401);

    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u', user_metadata: { role: 'teacher' } } as any);
    res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs'));
    expect(res.status).toBe(403);

    const mock = makeSupabaseMock({ audit_logs: () => supabaseOk([{ id: '1', action: 'x' }]) } as any);
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs?limit=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('limit clamped and DB error -> 500', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    const ok = makeSupabaseMock({ audit_logs: () => supabaseOk(new Array(3).fill(0).map((_, i) => ({ id: String(i) }))) } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(ok as any);
    let res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs?limit=999999'));
    expect(res.status).toBe(200);

    const err = makeSupabaseMock({ audit_logs: () => supabaseError('boom') } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(err as any);
    res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs'));
    expect(res.status).toBe(500);
  });
});


