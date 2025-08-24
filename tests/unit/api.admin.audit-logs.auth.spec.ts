import { GET as AuditGET } from '../../apps/web/src/app/api/admin/audit-logs/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/audit-logs auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs'));
    expect(res.status).toBe(401);
  });

  test('non-admin → 403', async () => {
    const res = await (AuditGET as any)(get('http://localhost/api/admin/audit-logs', { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });
});


