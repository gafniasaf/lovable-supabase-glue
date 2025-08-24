import { GET as ExportGET } from '../../apps/web/src/app/api/admin/export/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/export auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=profiles'));
    expect(res.status).toBe(401);
  });

  test('non-admin → 403', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=profiles', { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });
});


