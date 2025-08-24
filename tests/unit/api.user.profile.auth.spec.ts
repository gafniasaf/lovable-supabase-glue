import { GET as ProfileGET, PUT as ProfilePUT } from '../../apps/web/src/app/api/user/profile/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function put(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PUT', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/user/profile auth', () => {
  test('unauthenticated GET → 401', async () => {
    const res = await (ProfileGET as any)(get('http://localhost/api/user/profile'));
    expect(res.status).toBe(401);
  });

  test('unauthenticated PUT → 401', async () => {
    const res = await (ProfilePUT as any)(put('http://localhost/api/user/profile', { display_name: 'X' }));
    expect(res.status).toBe(401);
  });
});


