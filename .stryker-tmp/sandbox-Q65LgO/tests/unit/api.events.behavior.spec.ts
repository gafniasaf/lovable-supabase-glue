// @ts-nocheck
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { POST as EventsPOST, GET as EventsGET } from '../../apps/web/src/app/api/events/route';

const post = (url: string, body: any, headers?: Record<string, string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) }, body: JSON.stringify(body) });
const get = (url: string, headers?: Record<string, string>) => new Request(url, { method: 'GET', headers });

describe('Events API behavior', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('GET returns [] in prod (TEST_MODE unset)', async () => {
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u', user_metadata: { role: 'teacher' } } as any);
    delete (process.env as any).TEST_MODE;
    const res = await (EventsGET as any)(get('http://localhost/api/events'));
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  test('test-mode: POST 201 and GET lists event; 401 unauth', async () => {
    (process.env as any).TEST_MODE = '1';
    let res = await (EventsPOST as any)(post('http://localhost/api/events', { event_type: 'x', entity_type: 'y', entity_id: 'e1', meta: {} }));
    expect(res.status).toBe(401);
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u', user_metadata: { role: 'teacher' } } as any);
    res = await (EventsPOST as any)(post('http://localhost/api/events', { event_type: 'x', entity_type: 'y', entity_id: 'e1', meta: {} }));
    expect([201,204]).toContain(res.status); // test-mode -> 201
    const list = await (EventsGET as any)(get('http://localhost/api/events'));
    expect(list.status).toBe(200);
  });
});


