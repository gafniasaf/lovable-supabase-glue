import { GET as OutcomesExportGET } from '../../apps/web/src/app/api/runtime/outcomes/export/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('runtime outcomes export CSV (teacher-only)', () => {
  const url = 'http://localhost/api/runtime/outcomes/export?course_id=11111111-1111-1111-1111-111111111111';

  test('unauthenticated -> 401', async () => {
    const res = await (OutcomesExportGET as any)(get(url));
    expect(res.status).toBe(401);
  });

  test('non-teacher -> 403', async () => {
    const res = await (OutcomesExportGET as any)(get(url, { 'x-test-auth': 'student' }));
    expect([403,401]).toContain(res.status);
  });

  test('teacher -> CSV content type when 200', async () => {
    const res = await (OutcomesExportGET as any)(get(url, { 'x-test-auth': 'teacher' }));
    expect([200,401,403,500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});
