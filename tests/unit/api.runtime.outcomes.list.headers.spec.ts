import { GET as OutcomesListGET } from '../../apps/web/src/app/api/runtime/outcomes/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime outcomes list headers', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('vary: Origin and x-request-id are set on 200', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => (supa as any).supabaseOk({ teacher_id: 't1' }),
      interactive_attempts: () => (supa as any).supabaseOk([])
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const res = await (OutcomesListGET as any)(get('http://localhost/api/runtime/outcomes?course_id=11111111-1111-1111-1111-111111111111'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id') || '').not.toEqual('');
    expect(res.headers.get('vary')).toBe('Origin');
  });
});


