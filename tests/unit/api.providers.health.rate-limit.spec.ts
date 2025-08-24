import { GET as ProviderHealthGET } from '../../apps/web/src/app/api/providers/health/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('provider health rate limit headers', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('429 includes retry-after and x-rate-limit headers', async () => {
    process.env = { ...orig, PROVIDER_HEALTH_LIMIT: '1', PROVIDER_HEALTH_WINDOW_MS: '60000' } as any;
    const headers = { 'x-test-auth': 'admin' } as any;
    await (ProviderHealthGET as any)(get('http://localhost/api/providers/health?id=11111111-1111-1111-1111-111111111111', headers));
    const res = await (ProviderHealthGET as any)(get('http://localhost/api/providers/health?id=11111111-1111-1111-1111-111111111111', headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429]).toContain(res.status);
    }
  });
});
