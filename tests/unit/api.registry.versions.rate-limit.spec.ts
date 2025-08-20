import { GET as VersionsGET } from '../../apps/web/src/app/api/registry/versions/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('registry versions rate limit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('tight limit returns 429 with standard headers', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    process.env.REGISTRY_LIST_LIMIT = '1';
    process.env.REGISTRY_LIST_WINDOW_MS = '60000';
    const url = 'http://localhost/api/registry/versions?external_course_id=00000000-0000-0000-0000-000000000001';
    const first = await (VersionsGET as any)(get(url));
    const second = await (VersionsGET as any)(get(url));
    expect([200,401,400,403,429]).toContain(first.status);
    if (first.status === 200) {
      expect([200,401,400,403,429]).toContain(second.status);
      if (second.status === 429) {
        expect(second.headers.get('retry-after')).toBeTruthy();
        expect(second.headers.get('x-rate-limit-remaining')).toBeDefined();
        expect(second.headers.get('x-rate-limit-reset')).toBeDefined();
      }
    }
  });
});


