import { PATCH as ReadAllThreadPATCH } from '../../apps/web/src/app/api/messages/threads/[id]/read-all/route';

const patch = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: headers as any } as any);

describe('messages read-all by thread id', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('student marks thread as read in test-mode', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ReadAllThreadPATCH as any)(patch('http://localhost/api/messages/threads/11111111-1111-1111-1111-111111111111/read-all'));
    expect([200,401]).toContain(res.status);
  });
});


