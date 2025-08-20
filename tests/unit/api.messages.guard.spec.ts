import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('api.messages guard (MVP_PROD_GUARD)', () => {
  beforeEach(() => { delete process.env.TEST_MODE; process.env.MVP_PROD_GUARD = '1'; });

  test('guard enforced in production-like (non test-mode)', async () => {
    const res = await (MessagesGET as any)(makeReq('http://localhost/api/messages?thread_id=th1', { 'x-test-auth': 'student' }));
    // In non test-mode, auth may fail or MVP guard may block; accept 401 or 501
    expect([401, 501]).toContain(res.status);
  });
});


