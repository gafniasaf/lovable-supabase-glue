import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: { origin: 'https://provider.example', ...(headers||{}) } as any } as any);

describe('runtime v2 gating', () => {
  test('returns 403 when RUNTIME_API_V2 is disabled', async () => {
    delete (process.env as any).RUNTIME_API_V2;
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context'));
    expect(res.status).toBe(403);
  });
});


