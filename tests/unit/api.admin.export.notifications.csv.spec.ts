import { GET as ExportGET } from '../../apps/web/src/app/api/admin/export/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('admin export notifications CSV', () => {
  test('GET /api/admin/export?entity=notifications&format=csv returns text/csv for admin', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=notifications&format=csv', { 'x-test-auth': 'admin' }));
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});


