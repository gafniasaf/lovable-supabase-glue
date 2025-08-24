import { GET as OutcomesExportGET } from '../../apps/web/src/app/api/runtime/outcomes/export/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime outcomes export CSV headers', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('200 response includes CSV content-type and content-disposition', async () => {
    const mock = (supa as any).makeSupabaseMock({
      courses: () => (supa as any).supabaseOk({ teacher_id: 't1' }),
      interactive_attempts: () => (supa as any).supabaseOk([])
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const res = await (OutcomesExportGET as any)(get('http://localhost/api/runtime/outcomes/export?course_id=11111111-1111-1111-1111-111111111111'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    const cd = res.headers.get('content-disposition') || '';
    expect(cd).toMatch(/attachment; filename="interactive_attempts_11111111-1111-1111-1111-111111111111.csv"/);
  });
});


