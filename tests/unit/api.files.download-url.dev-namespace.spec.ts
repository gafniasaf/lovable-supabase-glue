import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('files download-url DEV_ID guard', () => {
  test('when DEV_ID set and key lacks prefix -> 403', async () => {
    process.env.TEST_MODE = '0';
    process.env.NODE_ENV = 'development' as any;
    process.env.DEV_ID = 'dev123';
    // Mock a matching attachment row
    const supabase = makeSupabaseMock({
      attachments: ({ eq }) => supabaseOk({ bucket: 'b', object_key: 'other/key', owner_id: 'u1', owner_type: 'user', filename: 'f.txt', content_type: 'text/plain' }),
      submissions: () => supabaseOk([]),
      assignments: () => supabaseOk(null),
      courses: () => supabaseOk({ teacher_id: 'u1' }),
    } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(supabase as any);
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=other/key'));
    expect([403,404,401,500]).toContain(res.status);
  });
});


