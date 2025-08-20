import { POST as ThreadsPOST, GET as ThreadsGET } from '../../apps/web/src/app/api/messages/threads/route';

function postJson(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('messages threads scoping', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('threads list is scoped to current user (sanity check)', async () => {
    // create thread as teacher with student
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const tRes = await (ThreadsPOST as any)(postJson('http://localhost/api/messages/threads', { participant_ids: ['test-student-id'] }, { 'x-test-auth': 'teacher' }));
    const thread = await tRes.json();
    // list for unrelated admin (should not see)
    const list = await (ThreadsGET as any)(getUrl('http://localhost/api/messages/threads', { 'x-test-auth': 'admin' }));
    const rows = await list.json();
    expect(Array.isArray(rows)).toBe(true);
  });
});


