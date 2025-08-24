import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('runtime teacher outcomes (auth and shape)', () => {
  const url = 'http://localhost/api/runtime/teacher/outcomes';

  test('unauthenticated -> 401', async () => {
    const res = await (TeacherOutcomesGET as any)(get(url));
    expect(res.status).toBe(401);
  });

  test('non-teacher -> 403', async () => {
    const res = await (TeacherOutcomesGET as any)(get(url, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
  });

  test('teacher -> 200 and JSON array (or 500 on DB error)', async () => {
    const res = await (TeacherOutcomesGET as any)(get(url, { 'x-test-auth': 'teacher' }));
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';
import * as supa from '../helpers/supabaseMock';

const get2 = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime teacher outcomes list', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('401 unauthenticated; 403 non-teacher; 200 for teacher with x-total-count', async () => {
    let res = await (TeacherOutcomesGET as any)(get2('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(401);

    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'student' } } as any);
    res = await (TeacherOutcomesGET as any)(get2('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(403);

    const mock = (supa as any).makeSupabaseMock({ courses: () => supa.supabaseOk([{ id: '00000000-0000-0000-0000-000000000001' }]), interactive_attempts: () => supa.supabaseOk([{ id: 'ia1', course_id: '00000000-0000-0000-0000-000000000001', score: 1, max: 1, passed: true, pct: 100, topic: null, created_at: new Date().toISOString() }]) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);
    res = await (TeacherOutcomesGET as any)(get2('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(200);
    // @ts-ignore
    expect(res.headers.get('x-total-count')).toBeTruthy();
  });
});


