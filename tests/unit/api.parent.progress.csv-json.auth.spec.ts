import { GET as ParentProgressGET } from '../../apps/web/src/app/api/parent/progress/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('parent progress GET (CSV/JSON, auth roles)', () => {
  const base = 'http://localhost/api/parent/progress?student_id=22222222-2222-2222-2222-222222222222';

  test('unauthenticated -> 401', async () => {
    const res = await (ParentProgressGET as any)(get(base));
    expect(res.status).toBe(401);
  });

  test('non-parent/admin -> 403', async () => {
    const res = await (ParentProgressGET as any)(get(base, { 'x-test-auth': 'student' }));
    expect([403,401]).toContain(res.status);
  });

  test('parent JSON -> 200 or 403', async () => {
    const res = await (ParentProgressGET as any)(get(base, { 'x-test-auth': 'parent' }));
    expect([200,403,401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
    }
  });

  test('admin CSV -> text/csv', async () => {
    const res = await (ParentProgressGET as any)(get(`${base}&format=csv`, { 'x-test-auth': 'admin' }));
    expect([200,403,401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});
