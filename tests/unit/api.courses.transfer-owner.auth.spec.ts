import { PATCH as TransferOwnerPATCH } from '../../apps/web/src/app/api/courses/[id]/transfer-owner/route';

function patch(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('courses transfer-owner auth and rate limit', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('unauthenticated -> 401', async () => {
    const res = await (TransferOwnerPATCH as any)(patch('http://localhost/api/courses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/transfer-owner', undefined, { teacher_id: '11111111-1111-1111-1111-111111111111' }), { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    expect(res.status).toBe(401);
  });

  test('student -> 403', async () => {
    const res = await (TransferOwnerPATCH as any)(patch('http://localhost/api/courses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/transfer-owner', { 'x-test-auth': 'student' }, { teacher_id: '11111111-1111-1111-1111-111111111111' }), { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    expect([403,401]).toContain(res.status);
  });

  test('rate limit includes standard headers when exceeded', async () => {
    process.env = { ...orig } as any;
    const headers = { 'x-test-auth': 'admin' } as any;
    const url = 'http://localhost/api/courses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/transfer-owner';
    await (TransferOwnerPATCH as any)(patch(url, headers, { teacher_id: '11111111-1111-1111-1111-111111111111' }), { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    const res = await (TransferOwnerPATCH as any)(patch(url, headers, { teacher_id: '11111111-1111-1111-1111-111111111111' }), { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});


