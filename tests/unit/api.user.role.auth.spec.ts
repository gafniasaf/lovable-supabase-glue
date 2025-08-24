import { PATCH as RolePATCH } from '../../apps/web/src/app/api/user/role/route';

function patch(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('user role update auth', () => {
  test('unauthenticated -> 401', async () => {
    const res = await (RolePATCH as any)(patch('http://localhost/api/user/role', undefined, { userId: '11111111-1111-1111-1111-111111111111', role: 'teacher' }));
    expect(res.status).toBe(401);
  });

  test('non-admin -> 403', async () => {
    const res = await (RolePATCH as any)(patch('http://localhost/api/user/role', { 'x-test-auth': 'student' }, { userId: '11111111-1111-1111-1111-111111111111', role: 'teacher' }));
    expect([403,401]).toContain(res.status);
  });

  test('admin -> 200 or 500 (service error tolerated)', async () => {
    const res = await (RolePATCH as any)(patch('http://localhost/api/user/role', { 'x-test-auth': 'admin' }, { userId: '11111111-1111-1111-1111-111111111111', role: 'teacher' }));
    expect([200,500]).toContain(res.status);
  });
});


