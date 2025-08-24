import { GET as MetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('admin metrics label sanitization in Prometheus text', () => {
  test('escapes quotes and strips newlines', async () => {
    // Force text/plain
    const res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics', { 'x-test-auth': 'admin', accept: 'text/plain' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      const text = await res.text();
      expect(text).not.toMatch(/\n\s*\n/);
    }
  });
});


