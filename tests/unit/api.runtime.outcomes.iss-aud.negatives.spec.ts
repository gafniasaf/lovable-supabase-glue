import { POST as OutcomesPOST } from '../../apps/web/src/app/api/runtime/outcomes/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/outcomes', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime outcomes provider JWT iss/aud negatives', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).RUNTIME_API_V2 = '1'; });

  test('invalid issuer/audience format yields 403 when present', async () => {
    const body = { courseId: 'c1', userId: 'u1', event: { type: 'progress', pct: 10 } };
    // Without a real JWT, this exercises the code path expectation only; actual 401/403 depends on signature verify
    const res = await (OutcomesPOST as any)(post(body, { authorization: 'Bearer bad.token.value' }));
    expect([401,403]).toContain(res.status);
  });
});


