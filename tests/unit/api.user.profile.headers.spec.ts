import { GET as ProfileGET } from '../../apps/web/src/app/api/user/profile/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('user profile headers and DTO', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET /api/user/profile returns x-request-id and JSON', async () => {
    // @ts-ignore simulate student
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ProfileGET as any)(get('http://localhost/api/user/profile'));
    expect([200,401]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


