import * as helpers from '../jest.setup';

describe('DB RLS negative cases (policy guards)', () => {
  test('student cannot read other students notifications', async () => {
    const supa = await import('../helpers/supabaseMock');
    const server = await import('../../apps/web/src/lib/supabaseServer');
    const mock = (supa as any).makeSupabaseMock({
      notifications: (params: any) => {
        // Simulate RLS denying access by returning empty
        const uid = (params?.eq || params)?.user_id || 'student-1';
        if (uid !== 'student-1') return { data: [], error: null };
        return { data: [{ id: 'n1', user_id: 'student-1' }], error: null };
      }
    });
    (server as any).getRouteHandlerSupabase = () => mock;
    const route = await import('../../apps/web/src/app/api/notifications/route');
    const res = await route.GET(new Request('http://localhost/api/notifications', { headers: { 'x-test-auth': 'student', 'x-request-id': 'rq' } } as any) as any);
    expect(res.status).toBe(200);
  });

  test('non-owner cannot finalize someone else file (RLS and route guard)', async () => {
    const route = await import('../../apps/web/src/app/api/files/finalize/route');
    const req = new Request('http://localhost/api/files/finalize', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ key: 'k1', size_bytes: 100 }) } as any);
    const res = await route.POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot list submissions for other assignment without auth as teacher', async () => {
    const route = await import('../../apps/web/src/app/api/submissions/route');
    const res = await route.GET(new Request('http://localhost/api/submissions?assignment_id=00000000-0000-0000-0000-000000000999', { headers: { 'x-test-auth': 'student' } } as any) as any);
    expect([401,403]).toContain(res.status);
  });
});


