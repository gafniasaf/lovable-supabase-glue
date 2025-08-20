// @ts-nocheck
import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('messages GET missing thread_id', () => {
  test('returns 400 with Problem and echoes request id', async () => {
    process.env.TEST_MODE = '1';
    const res = await (MessagesGET as any)(getUrl('http://localhost/api/messages', { 'x-test-auth': 'teacher', 'x-request-id': 'm1' }));
    expect(res.status).toBe(400);
    expect(res.headers.get('x-request-id')).toBe('m1');
    const json = await res.json();
    expect(json.error?.code).toBe('BAD_REQUEST');
  });
});


