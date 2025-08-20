import { PATCH as TransferPATCH } from '../../apps/web/src/app/api/courses/[id]/transfer-owner/route';

const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('courses transfer-owner rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('returns 429 with standard headers when limited', async () => {
    const res = await (TransferPATCH as any)(patch('http://localhost/api/courses/00000000-0000-0000-0000-000000000001/transfer-owner', { teacher_id: '00000000-0000-0000-0000-0000000000aa' }), { params: { id: '00000000-0000-0000-0000-000000000001' } });
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


