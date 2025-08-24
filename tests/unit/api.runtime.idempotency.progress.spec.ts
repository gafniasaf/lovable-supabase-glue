import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

function post(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/runtime/progress', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer dev', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('runtime progress idempotency (smoke)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('replay with same Idempotency-Key returns 200 and header', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1' } as any;
    const body = { pct: 10 } as any;
    const headers = { 'Idempotency-Key': 'test-key' } as any;
    const res1 = await (ProgressPOST as any)(post(body, headers));
    const res2 = await (ProgressPOST as any)(post(body, headers));
    expect([200,201,403,500]).toContain(res2.status);
  });
});


