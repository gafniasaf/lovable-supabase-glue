import { POST as CoursesPOST, PATCH as CoursesPATCH, DELETE as CoursesDELETE } from '../../apps/web/src/app/api/registry/courses/route';
import { POST as VersionsPOST, PATCH as VersionsPATCH } from '../../apps/web/src/app/api/registry/versions/route';

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('registry mutations rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'admin');
    (process.env as any).EXTERNAL_COURSES = '1';
  });

  test('courses POST returns 429 headers when limited', async () => {
    const res = await (CoursesPOST as any)(post('http://localhost/api/registry/courses', { vendor_id: '00000000-0000-0000-0000-000000000001', kind: 'v2', title: 't', description: 'd', version: '1', status: 'approved', launch_url: 'https://x', bundle_ref: 'b', scopes: ['progress.write'] }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('courses PATCH returns 429 headers when limited', async () => {
    const res = await (CoursesPATCH as any)(patch('http://localhost/api/registry/courses?id=00000000-0000-0000-0000-000000000002', { title: 'x' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('courses DELETE returns 429 headers when limited', async () => {
    const res = await (CoursesDELETE as any)(del('http://localhost/api/registry/courses?id=00000000-0000-0000-0000-000000000003'));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('versions POST returns 429 headers when limited', async () => {
    const res = await (VersionsPOST as any)(post('http://localhost/api/registry/versions', { external_course_id: '00000000-0000-0000-0000-000000000003', version: 'a', status: 'approved', manifest_hash: 'h', launch_url: 'https://x' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('versions PATCH returns 429 headers when limited', async () => {
    const res = await (VersionsPATCH as any)(patch('http://localhost/api/registry/versions?id=00000000-0000-0000-0000-000000000004', { status: 'disabled' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


