import * as supa from '../../apps/web/src/lib/supabaseServer';
import { GET as ExportGET } from '../../apps/web/src/app/api/admin/export/route';
import { makeSupabaseMock, supabaseOk, supabaseError } from './helpers/supabaseMock';

const get = (u: string, h?: Record<string, string>) => new Request(u, { method: 'GET', headers: h });

describe('Admin export API', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('401/403/400', async () => {
    let res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=courses'));
    expect(res.status).toBe(401);

    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 't', user_metadata: { role: 'teacher' } } as any);
    res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=courses'));
    expect(res.status).toBe(403);

    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=unknown'));
    expect(res.status).toBe(400);
  });

  test('json and csv formats', async () => {
    const mock = makeSupabaseMock({ courses: () => supabaseOk([{ id: 'c1', title: 'T' }]) } as any);
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);

    let res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=courses&format=json'));
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);

    res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=courses&format=csv'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toContain('text/csv');
    expect(res.headers.get('content-disposition') || '').toContain('attachment; filename=');
  });

  test('DB error -> 500 (covers select call path)', async () => {
    // Mock throws inside handler by making select chain reject
    const mock = {
      from: (_tbl: string) => ({ select: () => ({ then: (onFulfilled: any, onRejected: any) => onRejected(new Error('boom')) }) })
    } as any;
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=courses'));
    expect(res.status).toBe(500);
  });
});


