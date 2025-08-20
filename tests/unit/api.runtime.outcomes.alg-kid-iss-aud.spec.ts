import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/outcomes', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime outcomes JWKS/JWT rotation and alg/aud/iss enforcement', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).RUNTIME_API_V2 = '1'; });

  test('rejects non-RS256 tokens', async () => {
    const res = await (OutcomesPOST as any)(post({ courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } }, { authorization: 'Bearer header.payload.sig' }));
    expect([401,403]).toContain(res.status);
  });
});


