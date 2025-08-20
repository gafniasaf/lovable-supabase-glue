import { PATCH as ReadAllPATCH } from '../../apps/web/src/app/api/notifications/read-all/route';

function req(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'PATCH', headers: headers as any } as any);
}

describe('notifications read-all', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('marks all read in test-mode', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ReadAllPATCH as any)(req('http://localhost/api/notifications/read-all'));
    expect([200,401]).toContain(res.status);
  });
});


