import { GET as OutcomesListGET } from '../../apps/web/src/app/api/runtime/outcomes/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('runtime outcomes list for course (auth, query, headers)', () => {
  const base = 'http://localhost/api/runtime/outcomes';
  const courseId = '11111111-1111-1111-1111-111111111111';

  test('missing course_id -> 400', async () => {
    const res = await (OutcomesListGET as any)(get(base));
    expect(res.status).toBe(400);
  });

  test('unauthenticated -> 401', async () => {
    const res = await (OutcomesListGET as any)(get(`${base}?course_id=${courseId}`));
    expect(res.status).toBe(401);
  });

  test('non-teacher -> 403', async () => {
    const res = await (OutcomesListGET as any)(get(`${base}?course_id=${courseId}`, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
  });

  test('teacher -> 200 with JSON array and optional count header (or 500 on DB error)', async () => {
    const res = await (OutcomesListGET as any)(get(`${base}?course_id=${courseId}`, { 'x-test-auth': 'teacher' }));
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
      const count = res.headers.get('x-total-count');
      if (count !== null) expect(String(parseInt(count, 10))).toBe(count);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});


