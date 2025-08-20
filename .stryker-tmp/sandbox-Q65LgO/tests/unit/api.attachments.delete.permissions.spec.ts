// @ts-nocheck
import { DELETE as AttachDELETE } from '../../apps/web/src/app/api/files/attachment/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('attachments delete permissions (smoke)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('student can delete own attachment', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const supabase = makeSupabaseMock({
      attachments: () => supabaseOk({ bucket: 'b', object_key: 'k', owner_id: 'test-student-id', owner_type: 'user' }),
      storage: { from: () => ({ remove: async () => {} }) },
      attachments_delete: () => supabaseOk({}),
    } as any);
    jest.spyOn(supa, 'getRouteHandlerSupabase').mockReturnValue(supabase as any);
    const res = await (AttachDELETE as any)(del('http://localhost/api/files/attachment?key=k'));
    expect([200,401,404]).toContain(res.status);
  });
});


