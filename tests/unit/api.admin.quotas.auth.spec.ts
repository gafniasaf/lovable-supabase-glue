import { GET as QuotasGET, PATCH as QuotasPATCH } from '../../apps/web/src/app/api/admin/quotas/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/admin/quotas auth', () => {
  test('unauthenticated GET → 401', async () => {
    const res = await (QuotasGET as any)(get('http://localhost/api/admin/quotas'));
    expect(res.status).toBe(401);
  });

  test('non-admin GET → 403', async () => {
    const res = await (QuotasGET as any)(get('http://localhost/api/admin/quotas', { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });

  test('unauthenticated PATCH → 401', async () => {
    const res = await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', { user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', max_bytes: 100 }));
    expect(res.status).toBe(401);
  });

  test('non-admin PATCH → 403', async () => {
    const res = await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', { user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', max_bytes: 100 }, { 'x-test-auth': 'student' }));
    expect([401,403]).toContain(res.status);
  });
});


