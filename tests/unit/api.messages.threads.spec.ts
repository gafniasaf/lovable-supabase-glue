import { GET as ThreadsGET, POST as ThreadsPOST } from '../../apps/web/src/app/api/messages/threads/route';

function makeReq(url: string, method: string, body?: any, headers?: Record<string, string>) {
  return new Request(url, { method, headers: { 'content-type': 'application/json', ...(headers || {}) }, body: body ? JSON.stringify(body) : undefined });
}

describe('API /api/messages/threads (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth list → 401', async () => {
    const res = await (ThreadsGET as any)(makeReq('http://localhost/api/messages/threads', 'GET'));
    expect(res.status).toBe(401);
  });

  test('create thread and list with unread count', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    let res = await (ThreadsPOST as any)(makeReq('http://localhost/api/messages/threads', 'POST', { participant_ids: ['22222222-2222-2222-2222-222222222222'] }));
    expect(res.status).toBe(201);
    res = await (ThreadsGET as any)(makeReq('http://localhost/api/messages/threads', 'GET'));
    expect(res.status).toBe(200);
    const rows = await res.json();
    expect(Array.isArray(rows)).toBe(true);
  });
});


