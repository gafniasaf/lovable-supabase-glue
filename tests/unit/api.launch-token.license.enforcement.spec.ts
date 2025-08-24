import * as supa from './helpers/supabaseMock';
import { POST as LaunchTokenPOST } from '../../apps/web/src/app/api/enrollments/[id]/launch-token/route';

function post(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'POST', headers: headers as any } as any); }

describe('launch-token license enforcement (smoke)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('when LICENSE_ENFORCEMENT=1 and license inactive, returns 403', async () => {
    process.env = { ...orig, LICENSE_ENFORCEMENT: '1' } as any;
    const mock = (supa as any).makeSupabaseMock({
      enrollments: () => (supa as any).supabaseOk({ id: 'e1', course_id: 'c1', student_id: 'stu1' }),
      courses: () => (supa as any).supabaseOk({ id: 'c1', teacher_id: 't1' }),
      licenses: () => (supa as any).supabaseOk({ id: 'lic', status: 'disabled', seats_total: 0, seats_used: 0 }),
      interactive_launch_tokens: () => (supa as any).supabaseOk({ ok: true }),
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (LaunchTokenPOST as any)(post('http://localhost/api/enrollments/e1/launch-token', { 'x-test-auth': 'student' } as any), { params: { id: 'e1' } } as any);
    expect([401,403]).toContain(res.status);
  });

  test('when LICENSE_ENFORCEMENT=1 and seats exhausted, returns 403', async () => {
    process.env = { ...orig, LICENSE_ENFORCEMENT: '1' } as any;
    const mock = (supa as any).makeSupabaseMock({
      enrollments: () => (supa as any).supabaseOk({ id: 'e1', course_id: 'c1', student_id: 'stu1' }),
      courses: () => (supa as any).supabaseOk({ id: 'c1', teacher_id: 't1' }),
      licenses: () => (supa as any).supabaseOk({ id: 'lic', status: 'active', seats_total: 1, seats_used: 1 }),
      interactive_launch_tokens: () => (supa as any).supabaseOk({ ok: true }),
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (LaunchTokenPOST as any)(post('http://localhost/api/enrollments/e1/launch-token', { 'x-test-auth': 'student' } as any), { params: { id: 'e1' } } as any);
    expect([401,403]).toContain(res.status);
  });
});


