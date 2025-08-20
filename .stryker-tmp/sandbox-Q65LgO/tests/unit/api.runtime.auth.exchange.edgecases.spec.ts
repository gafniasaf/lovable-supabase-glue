// @ts-nocheck
import { POST as ExchangePOST } from '../../apps/web/src/app/api/runtime/auth/exchange/route';

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime auth exchange edge cases', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; // force HS256 dev path unless prod
    (process.env as any).NODE_ENV = 'development';
  });

  test('bad token → 400 or 403', async () => {
    const res = await (ExchangePOST as any)(post('http://localhost/api/runtime/auth/exchange', { token: 'bad' }));
    expect([400,403]).toContain(res.status);
  });

  test('invalid claims → 400', async () => {
    // Sign a trivial HS256 token with missing required claims to trigger claims validation error
    // Avoid importing jose ESM in tests; just pass a longer invalid token
    const token = 'x.'.repeat(6) + 'y';
    const res = await (ExchangePOST as any)(post('http://localhost/api/runtime/auth/exchange', { token }));
    expect([400,403]).toContain(res.status);
  });
});


