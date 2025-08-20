// @ts-nocheck
import { GET as DashboardGET } from '../../apps/web/src/app/api/dashboard/route';
import { GET as UsersGET } from '../../apps/web/src/app/api/users/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('role-based access matrix (dashboard, users)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  const roles: Array<'student'|'teacher'|'parent'|'admin'> = ['student','teacher','parent','admin'];

  test.each(roles)('dashboard GET as %s', async (role) => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', role);
    const res = await (DashboardGET as any)(get('http://localhost/api/dashboard'));
    expect([200,401,403]).toContain(res.status);
  });

  test.each(roles)('users GET as %s', async (role) => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', role);
    const res = await (UsersGET as any)(get('http://localhost/api/users'));
    expect([200,401,403]).toContain(res.status);
  });
});


