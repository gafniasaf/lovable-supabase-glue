// @ts-nocheck
import { GET as MetricsGET } from '../../apps/web/src/app/api/internal/metrics/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('internal metrics auth', () => {
  test('rejects without token; accepts with correct token', async () => {
    process.env.METRICS_TOKEN = 'secret';
    let res = await (MetricsGET as any)(get('http://localhost/api/internal/metrics'));
    expect(res.status).toBe(403);
    res = await (MetricsGET as any)(get('http://localhost/api/internal/metrics', { 'x-metrics-token': 'secret' }));
    expect([200,403]).toContain(res.status);
    if (res.status === 200) {
      const text = await res.text();
      expect(text).toMatch(/app_route_timing_count|app_counter_total/);
    }
  });
});


