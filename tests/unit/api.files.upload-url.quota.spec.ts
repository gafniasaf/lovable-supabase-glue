import { POST as UploadUrlPOST } from '../../apps/web/src/app/api/files/upload-url/route';
import * as supa from '../helpers/supabaseMock';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('files upload-url quota enforcement', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, STORAGE_QUOTA_ENABLED: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('413 when expected_bytes exceed remaining quota', async () => {
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore simulate user auth via test cookie
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const mock = (supa as any).makeSupabaseMock({ user_storage_quotas: () => supa.supabaseOk({ max_bytes: 1000, used_bytes: 900 }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const res = await (UploadUrlPOST as any)(post({ owner_type: 'user', owner_id: 'u1', content_type: 'image/png', expected_bytes: 200 }));
    expect(res.status).toBe(413);
  });
});


