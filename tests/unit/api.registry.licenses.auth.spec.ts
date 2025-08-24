import { GET as LicGET, PATCH as LicPATCH } from '../../apps/web/src/app/api/registry/licenses/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/registry/licenses auth (scaffold)', () => {
  test('unauthenticated GET → 401', async () => {
    const res = await (LicGET as any)(get('http://localhost/api/registry/licenses'));
    expect(res.status).toBe(401);
  });

  test('unauthenticated PATCH → 401', async () => {
    const res = await (LicPATCH as any)(patch('http://localhost/api/registry/licenses', { id: '1', action: 'enforce' }));
    expect(res.status).toBe(401);
  });
});


