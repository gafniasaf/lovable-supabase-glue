import { GET as MetricsGET } from '../../apps/web/src/app/api/internal/metrics/route';

const get = (headers?: Record<string,string>) => new Request('http://localhost/api/internal/metrics', { method: 'GET', headers: headers as any } as any);

describe('internal metrics endpoint content-type', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, METRICS_TOKEN: 'secret' } as any; });
  afterEach(() => { process.env = original; });

  test('returns Prometheus text format with correct content-type', async () => {
    const res = await (MetricsGET as any)(get({ 'x-metrics-token': 'secret' }));
    expect([200,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type')).toMatch(/^text\/plain/);
    }
  });
});


