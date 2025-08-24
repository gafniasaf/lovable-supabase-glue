import { POST as EventsPOST } from '../../apps/web/src/app/api/events/route';

function post(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/events (analytics ingestion)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauthenticated → 401', async () => {
    const res = await (EventsPOST as any)(post('http://localhost/api/events', { event_type: 'x', entity_type: 'y', entity_id: 'z', meta: {} }));
    expect([401,403]).toContain(res.status);
  });

  test('teacher authed → 2xx', async () => {
    // @ts-ignore simulate teacher auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (EventsPOST as any)(post('http://localhost/api/events', { event_type: 'x', entity_type: 'y', entity_id: 'z', meta: {} }));
    expect([200,201]).toContain(res.status);
  });
});
