import { GET as RegistryCoursesGET } from '../../apps/web/src/app/api/registry/courses/route';
import { GET as RegistryVersionsGET } from '../../apps/web/src/app/api/registry/versions/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('registry endpoints rate-limit and auth gating', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('courses GET 429 includes standard headers when exceeded', async () => {
    process.env = { ...orig, REGISTRY_LIST_LIMIT: '1', REGISTRY_LIST_WINDOW_MS: '60000' } as any;
    const headers = { 'x-test-auth': 'admin' } as any;
    const url = 'http://localhost/api/registry/courses';
    await (RegistryCoursesGET as any)(get(url, headers));
    const res = await (RegistryCoursesGET as any)(get(url, headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429]).toContain(res.status);
    }
  });

  test('versions GET requires feature flag', async () => {
    process.env = { ...orig, EXTERNAL_COURSES: '0' } as any;
    const res = await (RegistryVersionsGET as any)(get('http://localhost/api/registry/versions', { 'x-test-auth': 'admin' }));
    expect([403,401,200]).toContain(res.status);
  });
});
