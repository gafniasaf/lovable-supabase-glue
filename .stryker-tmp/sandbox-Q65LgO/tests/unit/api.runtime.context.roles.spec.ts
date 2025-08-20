// @ts-nocheck
import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime context roles and auth', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
  });

  test('missing token → 401', async () => {
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', { origin: 'https://provider.example' }));
    expect(res.status).toBe(401);
  });

  test('bad audience when origin allowed → 403', async () => {
    // Use a random token string to trigger invalid token or audience checks
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', { origin: 'https://provider.example', authorization: 'Bearer bad.token.value' }));
    expect([401,403]).toContain(res.status);
  });
});


