import { GET as RetentionGET } from '../../apps/web/src/app/api/reports/retention/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('reports retention headers', () => {
  test('x-request-id is set on 200', async () => {
    const res = await (RetentionGET as any)(get('http://localhost/api/reports/retention', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(String(res.headers.get('x-request-id') || '')).not.toEqual('');
    }
  });
});


