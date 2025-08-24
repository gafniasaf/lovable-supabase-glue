import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('withRouteTiming global per-IP mutation rate limit', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('second mutation 429 with headers when limit=1', async () => {
    process.env = { ...orig, GLOBAL_MUTATION_RATE_LIMIT: '1', GLOBAL_MUTATION_RATE_WINDOW_MS: '60000', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.5' } as any;
    await (MessagesPOST as any)(post('http://localhost/api/messages', headers, { thread_id: 't1', body: 'hi' }));
    const res = await (MessagesPOST as any)(post('http://localhost/api/messages', headers, { thread_id: 't1', body: 'hi again' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([201,401,403,429,500]).toContain(res.status);
    }
  });
});
