import { GET as ThreadsGET, POST as ThreadsPOST } from '../../apps/web/src/app/api/messages/threads/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function post(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/messages/threads auth', () => {
  test('unauthenticated GET → 401', async () => {
    const res = await (ThreadsGET as any)(get('http://localhost/api/messages/threads'));
    expect(res.status).toBe(401);
  });

  test('unauthenticated POST → 401', async () => {
    const res = await (ThreadsPOST as any)(post('http://localhost/api/messages/threads', { participant_ids: [] }));
    expect(res.status).toBe(401);
  });
});


