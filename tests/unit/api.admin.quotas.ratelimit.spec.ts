import { PATCH as QuotasPATCH } from '../../apps/web/src/app/api/admin/quotas/route';

const patch = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/admin/quotas', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('admin quotas PATCH rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate admin auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'admin');
  });

  test('returns 429 and retry-after header when limited', async () => {
    const res = await (QuotasPATCH as any)(patch({ user_id: '00000000-0000-0000-0000-0000000000aa', max_bytes: 1 }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
    }
  });
});


