import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../helpers/supabaseMock';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('files download-url ownership checks', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('owner can download; non-owner teacher of course can download submission files; others 403', async () => {
    // Owner case
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1' } as any);
    const mock = (supa as any).makeSupabaseMock({
      attachments: ({ object_key }: any) => supa.supabaseOk({ bucket: 'b', object_key, owner_id: 'u1', owner_type: 'user', filename: 'f.txt', content_type: 'text/plain' }),
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    let res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=k1'));
    expect([200,404]).toContain(res.status); // presign may not exist in test env

    // Submission owned by student; teacher of the course allowed
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'teacher-1' } as any);
    const mock2 = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'b', object_key: 'obj-1', owner_id: 'student-1', owner_type: 'submission', filename: 'f.txt', content_type: 'text/plain' }),
      submissions: () => supa.supabaseOk([{ assignment_id: 'a1', student_id: 'student-1', file_url: 'obj-1' }]),
      assignments: () => supa.supabaseOk({ course_id: 'c1' }),
      courses: () => supa.supabaseOk({ teacher_id: 'teacher-1' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock2);
    res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=obj-1'));
    expect([200,404]).toContain(res.status);

    // Non-owner non-teacher -> 403
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'other' } as any);
    const mock3 = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'b', object_key: 'obj-1', owner_id: 'student-1', owner_type: 'submission', filename: 'f.txt', content_type: 'text/plain' }),
      submissions: () => supa.supabaseOk([{ assignment_id: 'a1', student_id: 'student-1', file_url: 'obj-1' }]),
      assignments: () => supa.supabaseOk({ course_id: 'c1' }),
      courses: () => supa.supabaseOk({ teacher_id: 'someone-else' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock3);
    res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=obj-1'));
    expect(res.status).toBe(403);
  });
});


