import { GET as ProvidersGET } from '../../apps/web/src/app/api/providers/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('providers list DTO + headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET /api/providers returns x-request-id and JSON array or 401/403', async () => {
    const res = await (ProvidersGET as any)(get('http://localhost/api/providers'));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    if (res.status === 200) {
      const ct = res.headers.get('content-type') || '';
      expect(ct.includes('application/json')).toBeTruthy();
    }
  });
});


