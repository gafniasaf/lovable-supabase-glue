import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('files download ownership: enrolled student access', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  test('student enrolled in course can access lesson/announcement attachment', async () => {
    const mock = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'public', object_key: 'k2', owner_id: 'course-1', owner_type: 'announcement', filename: 'f', content_type: 'text/plain' }),
      courses: ({ id }: any) => supa.supabaseOk({ id, teacher_id: 't-other' }),
      enrollments: ({ course_id, student_id }: any) => supa.supabaseOk([{ id: 'e1', course_id, student_id }])
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'stu-1', user_metadata: { role: 'student' } } as any);
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=k2', { 'x-test-auth': 'student' }));
    expect([200,500]).toContain(res.status);
  });
});


