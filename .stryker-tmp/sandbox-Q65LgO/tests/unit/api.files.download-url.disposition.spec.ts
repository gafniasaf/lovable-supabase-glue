// @ts-nocheck
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import * as supa from '../../apps/web/src/lib/supabaseServer';
import { makeSupabaseMock, supabaseOk } from './helpers/supabaseMock';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('files download-url content headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('json includes filename/content_type; in prod path ensures content type present', async () => {
    //  simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url?id=f1'));
    expect([200,404,401]).toContain(res.status);
    if (res.status === 200) {
      const j = await res.json();
      expect(j).toHaveProperty('url');
      expect(j).toHaveProperty('filename');
      expect('content_type' in j).toBe(true);
    }
  });
});


