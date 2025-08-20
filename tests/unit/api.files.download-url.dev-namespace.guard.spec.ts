import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../helpers/supabaseMock';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('files download-url dev namespace guard', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, NODE_ENV: 'development', DEV_ID: 'dev123' } as any; });
  afterEach(() => { process.env = original; });

  test('403 when object_key missing DEV_ID prefix in dev with DEV_ID set', async () => {
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u1' } as any);
    const mock = (supa as any).makeSupabaseMock({
      attachments: () => supa.supabaseOk({ bucket: 'b', object_key: 'someone_else/file.txt', owner_id: 'u1', owner_type: 'user', filename: 'f', content_type: 'text/plain' })
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=someone_else/file.txt'));
    expect(res.status).toBe(403);
  });
});


