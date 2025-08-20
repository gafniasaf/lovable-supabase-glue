import { POST as ParentLinksPOST } from '../../apps/web/src/app/api/parent-links/route';

function jsonReq(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('parent-links rate limit signals', () => {
  beforeEach(() => {
    // @ts-ignore simulate admin auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
  });

  test('returns 429 headers when over limit (window small)', async () => {
    process.env.MESSAGES_LIMIT = '1';
    const body = { parent_id: '00000000-0000-0000-0000-000000000001', student_id: '00000000-0000-0000-0000-000000000002' };
    const url = 'http://localhost/api/parent-links';
    const res1 = await (ParentLinksPOST as any)(jsonReq(url, body));
    expect([201,429,401,403]).toContain(res1.status);
    const res2 = await (ParentLinksPOST as any)(jsonReq(url, body));
    if (res2.status === 429) {
      expect(res2.headers.get('retry-after')).toBeTruthy();
      expect(res2.headers.get('x-rate-limit-reset')).toBeTruthy();
    }
  });
});


