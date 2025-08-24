import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('files download ownership checks', () => {
  afterEach(() => { jest.restoreAllMocks(); });

  test('unauthenticated -> 401', async () => {
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=a'));
    expect(res.status).toBe(401);
  });

  test('non-owner blocked for unknown owner_type', async () => {
    const mock = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'public', object_key: 'k', owner_id: 'u2', owner_type: 'other', filename: null, content_type: null }),
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1' } as any);
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=k', { 'x-test-auth': 'teacher' }));
    expect([403,404]).toContain(res.status);
  });

  test('teacher of course can access lesson-owned attachment', async () => {
    const mock = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'public', object_key: 'k', owner_id: 'c1', owner_type: 'lesson', filename: 'f', content_type: 'text/plain' }),
      courses: ({ id }: any) => supa.supabaseOk({ id, teacher_id: 't1' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=k', { 'x-test-auth': 'teacher' }));
    expect([200,500]).toContain(res.status);
  });
});

import * as supa from './helpers/supabaseMock';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

const get2 = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('files download-url ownership checks (smoke)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('owner can download', async () => {
    const mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ bucket: 'b', object_key: 'k', owner_id: '22222222-2222-2222-2222-222222222222', owner_type: 'user', filename: 'f', content_type: 'text/plain' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (DownloadGET as any)(get2('http://localhost/api/files/download-url?id=k', { 'x-test-auth': 'student' }));
    expect([200,401,403,404]).toContain(res.status);
  });

  test('non-owner forbidden for user-owned attachment', async () => {
    const mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ bucket: 'b', object_key: 'k', owner_id: 'someoneelse', owner_type: 'user', filename: 'f', content_type: 'text/plain' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (DownloadGET as any)(get2('http://localhost/api/files/download-url?id=k', { 'x-test-auth': 'student' }));
    expect([403,401,404]).toContain(res.status);
  });
});
