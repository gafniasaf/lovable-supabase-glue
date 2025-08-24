import { GET as TeacherOutcomesGET } from '../../apps/web/src/app/api/runtime/teacher/outcomes/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('runtime teacher outcomes headers', () => {
  const url = 'http://localhost/api/runtime/teacher/outcomes';

  test('teacher -> vary and request id headers set', async () => {
    const res = await (TeacherOutcomesGET as any)(get(url, { 'x-test-auth': 'teacher' }));
    expect([200,500]).toContain(res.status);
    const rid = res.headers.get('x-request-id');
    expect(typeof rid === 'string' && rid.length > 0).toBe(true);
    expect(res.headers.get('vary')).toBe('Origin');
  });
});


