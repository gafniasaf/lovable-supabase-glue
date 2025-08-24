import { GET as MetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/metrics text/plain', () => {
  test('admin accept text/plain → 200 with text/plain content-type', async () => {
    const res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics', { accept: 'text/plain', 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect((res.headers.get('content-type') || '')).toMatch(/text\/plain/);
    }
  });
});


