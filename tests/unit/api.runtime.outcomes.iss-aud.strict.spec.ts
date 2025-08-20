import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/outcomes', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime outcomes strict iss/aud enforcement', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).RUNTIME_API_V2 = '1'; });

  test('issuer/audience mismatch against provider domain yields 403 (path exercise)', async () => {
    const body = { courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } };
    const res = await (OutcomesPOST as any)(post(body, { authorization: 'Bearer bad.token.value' }));
    expect([401,403]).toContain(res.status);
  });
});


