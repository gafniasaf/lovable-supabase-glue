import { GET as VersionsGET } from '../../apps/web/src/app/api/registry/versions/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('registry versions DTO + headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).EXTERNAL_COURSES = '1'; });

  test('GET /api/registry/versions returns x-request-id and optionally x-total-count', async () => {
    const res = await (VersionsGET as any)(get('http://localhost/api/registry/versions'));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


