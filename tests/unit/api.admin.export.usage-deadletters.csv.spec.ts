import { GET as ExportGET } from '../../apps/web/src/app/api/admin/export/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('admin export CSV for usage and dead_letters (smoke)', () => {
  test('usage CSV content-type when 200', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=usage&format=csv', { 'x-test-auth': 'admin' }));
    if (res.status === 200) {
      expect((res.headers.get('content-type') || '')).toMatch(/text\/csv/);
    } else {
      expect([401,403]).toContain(res.status);
    }
  });

  test('dead_letters CSV content-type when 200', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=dead_letters&format=csv', { 'x-test-auth': 'admin' }));
    if (res.status === 200) {
      expect((res.headers.get('content-type') || '')).toMatch(/text\/csv/);
    } else {
      expect([401,403]).toContain(res.status);
    }
  });
  test('licenses CSV content-type when 200', async () => {
    const res = await (ExportGET as any)(get('http://localhost/api/admin/export?entity=licenses&format=csv', { 'x-test-auth': 'admin' }));
    if (res.status === 200) {
      expect((res.headers.get('content-type') || '')).toMatch(/text\/csv/);
    } else {
      expect([401,403]).toContain(res.status);
    }
  });
});


