import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime teacher outcomes count header', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('sets x-total-count when count is available', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => (supa as any).supabaseOk([{ id: 'c1' }]),
      interactive_attempts: () => ({ data: [{ id: 'ia1', course_id: 'c1' }], error: null, count: 123 } as any)
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-total-count')).toBe('123');
  });
});


