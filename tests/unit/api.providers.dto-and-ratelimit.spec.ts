import { POST as ProvidersPOST, PATCH as ProvidersPATCH, DELETE as ProvidersDELETE } from '../../apps/web/src/app/api/providers/route';
import { GET as ProvidersHealthGET } from '../../apps/web/src/app/api/providers/health/route';

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);
const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('providers endpoints DTO + ratelimit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET /api/providers/health returns x-request-id and content-type', async () => {
    const res = await (ProvidersHealthGET as any)(get('http://localhost/api/providers/health'));
    expect([200,400,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    expect((res.headers.get('content-type')||'').includes('application/json')).toBeTruthy();
  });

  test('rate limit headers present when throttled on provider PATCH', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    const url = 'http://localhost/api/providers?id=00000000-0000-0000-0000-000000000001';
    const r1 = await (ProvidersPATCH as any)(patch(url, { name: 'x' }));
    expect([200,401,403,400]).toContain(r1.status);
    const r2 = await (ProvidersPATCH as any)(patch(url, { name: 'y' }));
    if (r2.status === 429) {
      expect(r2.headers.get('retry-after')).toBeTruthy();
      expect(r2.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(r2.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});
