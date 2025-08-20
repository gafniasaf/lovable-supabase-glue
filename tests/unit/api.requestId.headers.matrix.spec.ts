import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';
import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';
import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('x-request-id presence on error responses', () => {
  test('health 200 includes x-request-id', async () => {
    const res = await (HealthGET as any)(get('http://localhost/api/health', { 'x-request-id': 'rq-1' }));
    expect(res.headers.get('x-request-id')).toBe('rq-1');
  });

  test('messages POST unauthenticated 401 includes x-request-id', async () => {
    const res = await (MessagesPOST as any)(post('http://localhost/api/messages', { thread_id: '00000000-0000-0000-0000-000000000001', body: 'hi' }));
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('runtime progress 403 when disabled includes x-request-id', async () => {
    const original = { ...process.env } as any;
    process.env = { ...original, RUNTIME_API_V2: '0', NEXT_RUNTIME_SECRET: 'dev-secret' } as any;
    const res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', { pct: 1 }));
    expect([401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    process.env = original;
  });
});



