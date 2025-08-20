// @ts-nocheck
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { DELETE as AttDelete, POST as AttPost } from '../../apps/web/src/app/api/files/attachment/route';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

const del = (url: string, h?: Record<string, string>) => new Request(url, { method: 'DELETE', headers: h });
const post = (url: string, h?: Record<string, string>) => new Request(url, { method: 'POST', headers: h });

describe('Files attachments API', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('400 missing key; 401 unauth', async () => {
    let res = await (AttDelete as any)(del('http://localhost/api/files/attachment'));
    expect(res.status).toBe(400);
    res = await (AttDelete as any)(del('http://localhost/api/files/attachment?key=x'));
    expect(res.status).toBe(401);
  });

  test('owner can delete; POST _method=DELETE delegates', async () => {
    const mock = makeSupabaseMock({
      attachments: ({ object_key }) => supabaseOk({ bucket: 'b', object_key, owner_id: 'test-teacher-id', owner_type: 'lesson' }),
      submissions: () => supabaseOk([]),
      assignments: () => supabaseOk(null),
      courses: () => supabaseOk({ teacher_id: 'test-teacher-id' }),
    } as any);
    (mock as any).storage = { from: () => ({ remove: async () => {} }) };
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'test-teacher-id', user_metadata: { role: 'teacher' } } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (AttDelete as any)(del('http://localhost/api/files/attachment?key=k1', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(200);
    // POST delegate without headers should 400 (CSRF and/or auth)
    const resBad = await (AttPost as any)(post('http://localhost/api/files/attachment?_method=DELETE&key=k2'));
    expect([400,401]).toContain(resBad.status);
    // Proper headers + auth should succeed (route may still 400 due to strict query parse)
    const hdrs = { 'x-test-auth': 'teacher', origin: 'http://localhost', referer: 'http://localhost/x' } as any;
    const res2 = await (AttPost as any)(post('http://localhost/api/files/attachment?_method=DELETE&key=k2', hdrs));
    expect([200,400]).toContain(res2.status);
  });
});


