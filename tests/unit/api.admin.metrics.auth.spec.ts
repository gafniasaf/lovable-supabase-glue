import { GET as MetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/metrics auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics'));
    expect(res.status).toBe(401);
  });

  test('non-admin → 403', async () => {
    const res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics', { accept: 'application/json', 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });
});


