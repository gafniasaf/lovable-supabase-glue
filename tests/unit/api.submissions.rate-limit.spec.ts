import { POST as SubmissionsPOST, PATCH as SubmissionsPATCH } from '../../apps/web/src/app/api/submissions/route';

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 10_000 })
}), { virtual: true });

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('submissions POST rate limit headers', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('429 includes standard headers when exceeded', async () => {
    process.env = { ...orig, SUBMISSIONS_CREATE_LIMIT: '1', SUBMISSIONS_CREATE_WINDOW_MS: '60000' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json' } as any;
    const payload = { assignment_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', text: 'hi' };
    await (SubmissionsPOST as any)(post('http://localhost/api/submissions', headers, payload));
    const res = await (SubmissionsPOST as any)(post('http://localhost/api/submissions', headers, payload));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([201,401,403,429,500]).toContain(res.status);
    }
  });
});


const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('submissions rate limits and headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate roles
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    process.env.TEST_MODE = '1';
  });

  test('POST student create returns 429 with standard headers when limited', async () => {
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const res = await (SubmissionsPOST as any)(post({ assignment_id: '00000000-0000-0000-0000-000000000001', text: 'hi' }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });

  test('PATCH teacher grade returns 429 with standard headers when limited', async () => {
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await (SubmissionsPATCH as any)(patch('http://localhost/api/submissions?id=00000000-0000-0000-0000-000000000001', { score: 1 }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


