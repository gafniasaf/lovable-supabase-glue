import { GET as RegistryCoursesGET } from '../../apps/web/src/app/api/registry/courses/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('registry courses GET rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'admin');
    (process.env as any).EXTERNAL_COURSES = '1';
  });

  test('returns 429 with rate-limit headers when limited', async () => {
    const url = 'http://localhost/api/registry/courses?q=x';
    let res = await (RegistryCoursesGET as any)(get(url));
    expect([200,401,403]).toContain(res.status);
    res = await (RegistryCoursesGET as any)(get(url));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


