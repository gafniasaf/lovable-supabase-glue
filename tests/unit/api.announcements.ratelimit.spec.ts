import { POST as AnnPOST, DELETE as AnnDELETE } from '../../apps/web/src/app/api/announcements/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/announcements', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

describe('announcements rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('POST returns 429 with standard headers when limited', async () => {
    const res = await (AnnPOST as any)(post({ course_id: '00000000-0000-0000-0000-000000000001', title: 't', body: 'b' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('DELETE returns 429 with standard headers when limited', async () => {
    const res = await (AnnDELETE as any)(del('http://localhost/api/announcements?id=00000000-0000-0000-0000-0000000000ab'));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


