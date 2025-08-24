import { GET as ThreadsGET, POST as ThreadsPOST } from '../../apps/web/src/app/api/messages/threads/route';
import { PATCH as ReadAllPATCH } from '../../apps/web/src/app/api/messages/threads/[id]/read-all/route';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

function post(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) } as any, body: JSON.stringify(body) } as any);
}

function patch(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: headers as any } as any);
}

describe('Messages threads routes nullability handling', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('GET /api/messages/threads returns 401 when unauthenticated', async () => {
    const res = await (ThreadsGET as any)(get('http://localhost/api/messages/threads'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body?.error?.code).toBe('UNAUTHENTICATED');
  });

  test('POST /api/messages/threads returns 401 when unauthenticated', async () => {
    const res = await (ThreadsPOST as any)(post('http://localhost/api/messages/threads', { participant_ids: [] }));
    expect(res.status).toBe(401);
  });

  test('PATCH /api/messages/threads/[id]/read-all returns 401 when unauthenticated', async () => {
    const res = await (ReadAllPATCH as any)(patch('http://localhost/api/messages/threads/th1/read-all'));
    expect(res.status).toBe(401);
  });
});


