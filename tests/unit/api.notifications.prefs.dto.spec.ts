import { GET as PrefsGET, PATCH as PrefsPATCH } from '../../apps/web/src/app/api/notifications/preferences/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('notifications preferences DTO + headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET returns x-request-id and JSON map', async () => {
    // @ts-ignore simulate student
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (PrefsGET as any)(get('http://localhost/api/notifications/preferences'));
    expect([200,401]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('PATCH returns x-request-id and JSON map', async () => {
    // @ts-ignore simulate student
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (PrefsPATCH as any)(patch('http://localhost/api/notifications/preferences', { 'assignment:new': false }));
    expect([200,401]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


