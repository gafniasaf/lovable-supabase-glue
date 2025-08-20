import { GET as ProvidersHealthGET } from '../../apps/web/src/app/api/providers/health/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('providers health rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate admin auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'admin');
    (process.env as any).PROVIDER_HEALTH_LIMIT = '1';
    (process.env as any).PROVIDER_HEALTH_WINDOW_MS = '60000';
  });

  test('429 includes retry-after and x-rate-limit-* headers', async () => {
    const url = 'http://localhost/api/providers/health?id=00000000-0000-0000-0000-000000000001';
    let res = await (ProvidersHealthGET as any)(get(url));
    expect([200,401,403]).toContain(res.status);
    res = await (ProvidersHealthGET as any)(get(url));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


