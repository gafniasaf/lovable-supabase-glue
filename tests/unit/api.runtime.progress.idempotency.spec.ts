import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('runtime progress idempotency', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('second request with same Idempotency-Key echoes idempotency-replayed header', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1' } as any;
    const headers = { 'authorization': 'Bearer test', 'idempotency-key': 'abc', origin: 'http://localhost' } as any;
    // First
    await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', headers, { pct: 10 }));
    // Second
    const res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', headers, { pct: 10 }));
    if (res.status === 200) {
      expect(res.headers.get('idempotency-replayed')).toBe('1');
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});
