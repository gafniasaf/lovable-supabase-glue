import { PATCH as ReadAllPATCH, POST as ReadAllPOST } from '../../apps/web/src/app/api/notifications/read-all/route';

const req = (method: 'PATCH'|'POST', headers?: Record<string,string>) => new Request('http://localhost/api/notifications/read-all', { method, headers: headers as any } as any);

describe('notifications read-all respects CSRF double-submit for non-GET', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost', TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('PATCH requires matching csrf_token and x-csrf-token', async () => {
    // Missing -> 403
    let res = await (ReadAllPATCH as any)(req('PATCH', { origin: 'http://localhost', referer: 'http://localhost/x' }));
    expect([400,403]).toContain(res.status);
    // Mismatch -> 403
    res = await (ReadAllPATCH as any)(req('PATCH', { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=a', 'x-csrf-token': 'b' }));
    expect([400,403]).toContain(res.status);
    // Match -> 200/401 depending on auth
    res = await (ReadAllPATCH as any)(req('PATCH', { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=t', 'x-csrf-token': 't' }));
    expect([200,401]).toContain(res.status);
  });

  test('POST (HTML form fallback) delegates and enforces CSRF similarly', async () => {
    let res = await (ReadAllPOST as any)(req('POST', { origin: 'http://localhost', referer: 'http://localhost/x' }));
    expect([400,403]).toContain(res.status);
    res = await (ReadAllPOST as any)(req('POST', { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=a', 'x-csrf-token': 'b' }));
    expect([400,403]).toContain(res.status);
    res = await (ReadAllPOST as any)(req('POST', { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=t', 'x-csrf-token': 't' }));
    expect([200,401]).toContain(res.status);
  });
});


