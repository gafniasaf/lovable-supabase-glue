import { GET as UsageGET } from '../../apps/web/src/app/api/admin/usage/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/admin/usage auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (UsageGET as any)(get('http://localhost/api/admin/usage'));
    expect(res.status).toBe(401);
  });
});


