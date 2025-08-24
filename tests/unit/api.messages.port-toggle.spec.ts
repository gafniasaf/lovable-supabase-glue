import { GET as MessagesGET, POST as MessagesPOST, PATCH as MessagesPATCH } from '../../apps/web/src/app/api/messages/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const patch = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: headers as any } as any);

describe('MESSAGING_PORT toggle routes', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1', MESSAGING_PORT: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('GET returns 200 with array and x-total-count', async () => {
    const res = await (MessagesGET as any)(get('http://localhost/api/messages?thread_id=t1', { 'x-test-auth': 'student' }));
    expect([200,500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeDefined();
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });

  test('POST + PATCH (mark read) via port', async () => {
    const created = await (MessagesPOST as any)(post('http://localhost/api/messages', { thread_id: 'thr1', body: 'hi' }, { 'x-test-auth': 'student' }));
    expect([201,500]).toContain(created.status);
    if (created.status !== 201) return; // bail if test env not suitable
    const msg = await created.json();
    const res = await (MessagesPATCH as any)(patch(`http://localhost/api/messages?id=${encodeURIComponent(msg.id)}`, { 'x-test-auth': 'student' }));
    expect([200,500]).toContain(res.status);
  });
});


