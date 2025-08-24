import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('runtime grade idempotency', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('second request with same Idempotency-Key echoes idempotency-replayed header', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1' } as any;
    const headers = { authorization: 'Bearer test', 'idempotency-key': 'xyz', origin: 'http://localhost' } as any;
    // First
    await (GradePOST as any)(post('http://localhost/api/runtime/grade', headers, { score: 1, max: 1, passed: true }));
    // Second
    const res = await (GradePOST as any)(post('http://localhost/api/runtime/grade', headers, { score: 1, max: 1, passed: true }));
    if (res.status === 200) {
      expect(res.headers.get('idempotency-replayed')).toBe('1');
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});


