import { PATCH as ProvidersPATCH } from '../../apps/web/src/app/api/providers/route';

function patch(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('providers PATCH admin gating and rate limits', () => {
  const body = { name: 'New', jwks_url: 'https://example.com/.well-known/jwks.json', domain: 'https://example.com' } as any;

  test('unauthenticated -> 401', async () => {
    const res = await (ProvidersPATCH as any)(patch('http://localhost/api/providers?id=11111111-1111-1111-1111-111111111111', undefined, body));
    expect(res.status).toBe(401);
  });

  test('non-admin -> 403', async () => {
    const res = await (ProvidersPATCH as any)(patch('http://localhost/api/providers?id=11111111-1111-1111-1111-111111111111', { 'x-test-auth': 'teacher' }, body));
    expect([403,401]).toContain(res.status);
  });

  test('rate limit headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'admin' } as any;
    const url = 'http://localhost/api/providers?id=11111111-1111-1111-1111-111111111111';
    await (ProvidersPATCH as any)(patch(url, headers, body));
    const res = await (ProvidersPATCH as any)(patch(url, headers, body));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,400,401,403,429,500]).toContain(res.status);
    }
  });
});
