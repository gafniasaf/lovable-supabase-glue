import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime teacher outcomes list', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('401 unauthenticated; 403 non-teacher; 200 for teacher with x-total-count', async () => {
    let res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(401);

    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'student' } } as any);
    res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(403);

    const mock = (supa as any).makeSupabaseMock({ courses: () => supa.supabaseOk([{ id: 'c1' }]), interactive_attempts: () => supa.supabaseOk([{ id: 'ia1', course_id: 'c1' }]) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);
    res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(200);
    // @ts-ignore
    expect(res.headers.get('x-total-count')).toBeTruthy();
  });
});


