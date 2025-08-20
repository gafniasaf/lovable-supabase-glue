import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { GET as ProgressGET } from '../../apps/web/src/app/api/progress/route';
import { makeSupabaseMock, supabaseError, supabaseOk } from './helpers/supabaseMock';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('GET /api/progress error paths', () => {
  beforeEach(() => { jest.restoreAllMocks(); delete (process.env as any).TEST_MODE; });

  test('500 when lessons query fails', async () => {
    const supa = makeSupabaseMock({ lessons: () => supabaseError('db down') });
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', email: 't@example.com', user_metadata: { role: 'teacher' } } as any);
    const res = await (ProgressGET as any)(makeReq('http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error?.code).toBe('DB_ERROR');
  });

  test('403 for per_student when not teacher (non-test mode)', async () => {
    const supa = makeSupabaseMock({ lessons: () => supabaseOk([{ id: 'l1' }]) });
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u2', email: 's@example.com', user_metadata: { role: 'student' } } as any);
    const res = await (ProgressGET as any)(makeReq('http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001&per_student=1'));
    expect(res.status).toBe(403);
  });
});


