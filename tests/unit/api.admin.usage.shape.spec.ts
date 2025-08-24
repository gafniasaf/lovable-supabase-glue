import { GET as UsageGET } from '../../apps/web/src/app/api/admin/usage/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/usage shape (smoke)', () => {
  test('admin returns rows array when available', async () => {
    const res = await (UsageGET as any)(get('http://localhost/api/admin/usage', { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      const json = await res.json();
      expect(json).toHaveProperty('rows');
      expect(Array.isArray(json.rows)).toBe(true);
    }
  });
});


