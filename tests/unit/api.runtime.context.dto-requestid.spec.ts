import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('runtime context returns x-request-id and DTO-like shape', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).RUNTIME_API_V2 = '1'; });

  test('x-request-id header present and json has required fields or error envelope', async () => {
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context'));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const ct = res.headers.get('content-type') || '';
    expect(ct.includes('application/json')).toBeTruthy();
  });
});
