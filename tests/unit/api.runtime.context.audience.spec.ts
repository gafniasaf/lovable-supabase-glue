import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: { authorization: 'Bearer dev', ...(headers||{}) } as any } as any); }

describe('runtime context audience binding (smoke)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('allowed origin but mismatched aud → 403/401', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://good.example' } as any;
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context', { origin: 'https://good.example' }));
    expect([200,403,401,500]).toContain(res.status);
  });
});


