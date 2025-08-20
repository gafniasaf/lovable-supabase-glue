import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';
import { GET as ExportGET } from '../../apps/web/src/app/api/runtime/outcomes/export/route';
import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function post(url: string, body: any, headers?: Record<string, string>) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) }, body: JSON.stringify(body) }); }
function get(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API runtime', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('events: unauth 401; missing courseId 400', async () => {
    let res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', {}));
    expect(res.status).toBe(401);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'student' } } as any);
    res = await (EventsPOST as any)(post('http://localhost/api/runtime/events', {}));
    expect(res.status).toBe(400);
  });

  test('export: unauth 401; missing course_id 400; csv headers; teacher-only enforcement', async () => {
    let res = await (ExportGET as any)(get('http://localhost/api/runtime/outcomes/export'));
    expect(res.status).toBe(401);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'teacher-1', user_metadata: { role: 'teacher' } } as any);
    res = await (ExportGET as any)(get('http://localhost/api/runtime/outcomes/export'));
    expect(res.status).toBe(400);
    const supa = makeSupabaseMock({
      courses: ({ id }) => supabaseOk(id ? { teacher_id: 'teacher-1' } : null),
      interactive_attempts: () => supabaseOk([]),
    } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    res = await (ExportGET as any)(get('http://localhost/api/runtime/outcomes/export?course_id=00000000-0000-0000-0000-00000000ffff'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type') || '').toContain('text/csv');
  });

  test('teacher outcomes: unauth 401; non-teacher 403; 200 with list', async () => {
    let res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(401);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1', user_metadata: { role: 'student' } } as any);
    res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(403);
    jest.spyOn(supabaseServer, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);
    const supa = makeSupabaseMock({
      courses: ({ teacher_id }) => supabaseOk([{ id: 'c1' }]),
      interactive_attempts: ({}) => supabaseOk([]),
    } as any);
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    res = await (TeacherOutcomesGET as any)(get('http://localhost/api/runtime/teacher/outcomes'));
    expect(res.status).toBe(200);
  });
});


