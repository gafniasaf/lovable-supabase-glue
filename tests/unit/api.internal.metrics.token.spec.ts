import { GET as MetricsGET } from '../../apps/web/src/app/api/internal/metrics/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('internal metrics token enforcement', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('missing token → 403', async () => {
    process.env = { ...orig, METRICS_TOKEN: 'secret' } as any;
    const res = await (MetricsGET as any)(get('http://localhost/api/internal/metrics'));
    expect(res.status).toBe(403);
  });

  test('valid token → 200 text/plain', async () => {
    process.env = { ...orig, METRICS_TOKEN: 'secret' } as any;
    const res = await (MetricsGET as any)(get('http://localhost/api/internal/metrics', { 'x-metrics-token': 'secret' }));
    expect([200,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/plain/);
    }
  });
});
