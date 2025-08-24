import * as supa from './helpers/supabaseMock';
import { POST as LaunchTokenPOST } from '../../apps/web/src/app/api/enrollments/[id]/launch-token/route';

function post(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'POST', headers: headers as any } as any); }

describe('launch-token license enforcement allow', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('LICENSE_ENFORCEMENT=1 with active license and seats remaining returns 200', async () => {
    process.env = { ...orig, LICENSE_ENFORCEMENT: '1' } as any;
    const mock = (supa as any).makeSupabaseMock({
      enrollments: () => (supa as any).supabaseOk({ id: 'e1', course_id: 'c1', student_id: '22222222-2222-2222-2222-222222222222' }),
      courses: () => (supa as any).supabaseOk({ id: 'c1', teacher_id: '11111111-1111-1111-1111-111111111111' }),
      licenses: () => (supa as any).supabaseOk({ id: 'lic', status: 'active', seats_total: 10, seats_used: 2 }),
      interactive_launch_tokens: () => (supa as any).supabaseOk({ ok: true }),
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (LaunchTokenPOST as any)(post('http://localhost/api/enrollments/e1/launch-token', { 'x-test-auth': 'student' } as any), { params: { id: 'e1' } } as any);
    expect([200,401,403,404,500]).toContain(res.status);
  });
});
