import { PATCH as RolePATCH } from '../../apps/web/src/app/api/user/role/route';

const patch = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/user/role', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('user role PATCH headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('x-request-id present on 2xx or guard response', async () => {
    const res = await (RolePATCH as any)(patch({ userId: '00000000-0000-0000-0000-000000000001', role: 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});
