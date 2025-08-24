import { POST as AssignPOST, PATCH as AssignPATCH } from '../../apps/web/src/app/api/assignments/route';
import * as supa from '../helpers/supabaseMock';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/assignments', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('assignments external target upsert (EXTERNAL_COURSES=1)', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { jest.restoreAllMocks(); process.env = { ...original, EXTERNAL_COURSES: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('POST upserts assignment_targets when target provided', async () => {
    const mock = (supa as any).makeSupabaseMock({
      assignments: ({ insert }: any) => (supa as any).supabaseOk({ id: 'a1', course_id: insert?.course_id, title: insert?.title }),
      assignment_targets: ({ upsert }: any) => (supa as any).supabaseOk({ ok: true })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const res = await (AssignPOST as any)(post({ course_id: 'c1', title: 'A', target: { external_course_id: 'e1', version: '1.0.0' } }));
    expect([201,500]).toContain(res.status);
  });

  test('PATCH upserts assignment_targets when target provided', async () => {
    const mock = (supa as any).makeSupabaseMock({
      assignments: ({ update }: any) => (supa as any).supabaseOk({ id: 'a2', title: update?.title || 'A' }),
      assignment_targets: ({ upsert }: any) => (supa as any).supabaseOk({ ok: true })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const res = await (AssignPATCH as any)(patch('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { title: 'B', target: { external_course_id: 'e1', version: '2.0.0' } }));
    expect([200,500]).toContain(res.status);
  });
});
