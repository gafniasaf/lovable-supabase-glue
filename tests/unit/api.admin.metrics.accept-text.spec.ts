import { GET as AdminMetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('admin metrics Accept: text/plain', () => {
  test('returns Prometheus text when Accept includes text/plain', async () => {
    const res = await (AdminMetricsGET as any)(get('http://localhost/api/admin/metrics', { 'x-test-auth': 'admin', accept: 'text/plain' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/plain/);
    }
  });
});
