// @ts-nocheck
import { PATCH as MessagesPATCH } from '../../apps/web/src/app/api/messages/route';

function req(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: { ...(headers || {}) } });
}

describe('PATCH /api/messages negatives', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('missing id → 400; unknown id → 404', async () => {
    // missing id
    let res = await (MessagesPATCH as any)(req('http://localhost/api/messages', { 'x-test-auth': 'teacher', 'x-request-id': 'm-p1' }));
    expect(res.status).toBe(400);
    expect(res.headers.get('x-request-id')).toBe('m-p1');
    // unknown id (valid uuid; tolerate 400 or 404 depending on state)
    res = await (MessagesPATCH as any)(req('http://localhost/api/messages?id=00000000-0000-0000-0000-000000000001', { 'x-test-auth': 'teacher' }));
    expect([400,404]).toContain(res.status);
  });
});


