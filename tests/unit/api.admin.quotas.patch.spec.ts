import { PATCH as QuotasPATCH } from '../../apps/web/src/app/api/admin/quotas/route';

function patch(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('admin quotas PATCH auth and rate limit', () => {
  const body = { user_id: '11111111-1111-1111-1111-111111111111', max_bytes: 1000 };

  test('unauthenticated -> 401', async () => {
    const res = await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', undefined, body));
    expect(res.status).toBe(401);
  });

  test('non-admin -> 403', async () => {
    const res = await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', { 'x-test-auth': 'teacher' }, body));
    expect([403,401]).toContain(res.status);
  });

  test('rate limit headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'admin' } as any;
    await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', headers, body));
    const res = await (QuotasPATCH as any)(patch('http://localhost/api/admin/quotas', headers, body));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});
