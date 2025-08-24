import { PATCH as ReadAllPATCH } from '../../apps/web/src/app/api/notifications/read-all/route';

function patch(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: headers as any } as any); }

describe('API /api/notifications/read-all auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (ReadAllPATCH as any)(patch('http://localhost/api/notifications/read-all'));
    expect(res.status).toBe(401);
  });
});


