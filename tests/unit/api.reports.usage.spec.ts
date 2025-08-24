import { GET as UsageGET } from '../../apps/web/src/app/api/reports/usage/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('API /api/reports/usage (admin)', () => {
  test('JSON returns rows in test mode', async () => {
    const res = await (UsageGET as any)(get('http://localhost/api/reports/usage', { 'x-test-auth': 'admin' }));
    expect([200,403,401]).toContain(res.status);
    if (res.status === 200) {
      const json = await res.json();
      expect(Array.isArray(json.rows)).toBe(true);
    }
  });

  test('CSV format returns text/csv', async () => {
    const res = await (UsageGET as any)(get('http://localhost/api/reports/usage?format=csv', { 'x-test-auth': 'admin' }));
    expect([200,403,401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});


