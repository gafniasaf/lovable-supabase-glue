import * as supa from './helpers/supabaseMock';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('files download DEV_ID namespace enforcement', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('rejects object key not prefixed by DEV_ID when set', async () => {
    process.env = { ...orig, DEV_ID: 'alice' } as any;
    const mock = (supa as any).makeSupabaseMock({ attachments: () => (supa as any).supabaseOk({ bucket: 'b', object_key: 'bob/other', owner_id: '22222222-2222-2222-2222-222222222222', owner_type: 'user', filename: 'f', content_type: 'text/plain' }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=bob/other', { 'x-test-auth': 'student' }));
    expect([403,401,404]).toContain(res.status);
  });
});
