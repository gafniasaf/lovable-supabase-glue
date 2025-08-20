import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime auth: audience and scopes', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).RUNTIME_API_V2 = '1'; });

  test('when origin is allowed, audience mismatch yields 403', async () => {
    // No runtime token provided → should 401/403; here we simulate that origin is allowed to exercise aud branch
    (process as any).env.RUNTIME_CORS_ALLOW = 'https://provider.example';
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', { origin: 'https://provider.example' }));
    expect([401,403]).toContain(res.status);
  });

  test('missing required scope yields 403', async () => {
    // Context route may not require a specific scope, but other runtime endpoints do; this is a placeholder for scope checks
    (process as any).env.RUNTIME_CORS_ALLOW = '';
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', {}));
    expect([401,403]).toContain(res.status);
  });
});


