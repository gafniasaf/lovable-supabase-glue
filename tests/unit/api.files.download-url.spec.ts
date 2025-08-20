import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('api.files.download-url', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('requires auth', async () => {
    const res = await (DownloadGET as any)(makeReq('http://localhost/api/files/download-url?id=f1'));
    expect(res.status).toBe(401);
  });

  test('returns 400 when id missing', async () => {
    const res = await (DownloadGET as any)(makeReq('http://localhost/api/files/download-url', { 'x-test-auth': 'student' }));
    expect(res.status).toBe(400);
  });
});


