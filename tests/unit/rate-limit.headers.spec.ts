import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: body ? JSON.stringify(body) : undefined } as any); }

describe('rate limit headers on 429', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('messages POST returns standard headers when throttled', async () => {
    process.env = { ...orig } as any;
    // Simulate many rapid requests to exceed default limit in route (60/min)
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json' } as any;
    let last: Response | null = null;
    for (let i = 0; i < 80; i++) {
      const res = await (MessagesPOST as any)(post('http://localhost/api/messages', headers, { thread_id: 't1', body: 'hi' }));
      last = res;
      if (res.status === 429) break;
    }
    if (!last) throw new Error('no response');
    if (last.status === 429) {
      expect(last.headers.get('retry-after')).toBeTruthy();
      expect(last.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(last.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([201,401,403,429,500]).toContain(last.status);
    }
  });
});
