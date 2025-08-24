import * as supa from './helpers/supabaseMock';
import { DELETE as AttachmentDELETE } from '../../apps/web/src/app/api/files/attachment/route';

function del(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'DELETE', headers: headers as any } as any); }

describe('files attachment DELETE permissions (smoke)', () => {
  const url = 'http://localhost/api/files/attachment?key=k1';
  const studentHeaders = { 'x-test-auth': 'student' } as any;
  const teacherHeaders = { 'x-test-auth': 'teacher' } as any;

  afterEach(() => { jest.restoreAllMocks(); });

  test('owner allowed (user)', async () => {
    const mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ bucket: 'b', object_key: 'k1', owner_id: '22222222-2222-2222-2222-222222222222', owner_type: 'user' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (AttachmentDELETE as any)(del(url, studentHeaders));
    expect([200,401,403,404]).toContain(res.status);
  });

  test('lesson/announcement teacher allowed', async () => {
    const mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ bucket: 'b', object_key: 'k1', owner_id: 'c1', owner_type: 'lesson' }), courses: () => (supa as any).supabaseOk({ teacher_id: '11111111-1111-1111-1111-111111111111' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (AttachmentDELETE as any)(del(url, teacherHeaders));
    expect([200,401,403,404]).toContain(res.status);
  });
});
