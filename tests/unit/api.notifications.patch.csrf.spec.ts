import { PATCH as NotifPrefsPATCH } from '../../apps/web/src/app/api/notifications/preferences/route';

const patch = (headers?: Record<string,string>) => new Request('http://localhost/api/notifications/preferences', { method: 'PATCH', headers: headers as any, body: JSON.stringify({ a: false }) } as any);

describe('notifications preferences PATCH respects CSRF double-submit', () => {
  const orig = { ...process.env };
  beforeEach(() => { process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any; });
  afterEach(() => { process.env = orig; });

  test('403 when tokens missing or mismatched; 200 when matched', async () => {
    // Missing tokens -> 403
    let res = await (NotifPrefsPATCH as any)(patch({ origin: 'http://localhost', referer: 'http://localhost/p' }));
    expect([400,403]).toContain(res.status);
    // Mismatch -> 403
    res = await (NotifPrefsPATCH as any)(patch({ origin: 'http://localhost', referer: 'http://localhost/p', cookie: 'csrf_token=a', 'x-csrf-token': 'b', 'content-type': 'application/json' }));
    expect([400,403]).toContain(res.status);
    // Match -> 200
    res = await (NotifPrefsPATCH as any)(patch({ origin: 'http://localhost', referer: 'http://localhost/p', cookie: 'csrf_token=t', 'x-csrf-token': 't', 'content-type': 'application/json', 'x-test-auth': 'student' }));
    expect([200]).toContain(res.status);
  });
});


