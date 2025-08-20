import { POST as LogoutPOST } from '../../apps/web/src/app/api/auth/logout/route';

describe('API /api/auth/logout', () => {
  test('returns 200 and clears test-mode cookie; idempotent', async () => {
    // seed cookie
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const req = new Request('http://localhost/api/auth/logout', { method: 'POST' } as any);
    let res = await (LogoutPOST as any)(req);
    expect(res.status).toBe(200);
    // call again
    res = await (LogoutPOST as any)(req);
    expect(res.status).toBe(200);
  });
});


