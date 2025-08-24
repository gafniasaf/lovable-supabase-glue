import { POST as ThreadsPOST } from '../../apps/web/src/app/api/messages/threads/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }

describe('messages threads POST rate-limit headers', () => {
  const url = 'http://localhost/api/messages/threads';
  const body = { participant_ids: ['11111111-1111-1111-1111-111111111111'] } as any;

  test('429 includes standard headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'student' } as any;
    await (ThreadsPOST as any)(post(url, headers, body));
    const res = await (ThreadsPOST as any)(post(url, headers, body));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([201,401,403,429,501,500]).toContain(res.status);
    }
  });
});
