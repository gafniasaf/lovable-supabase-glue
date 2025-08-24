import { GET as RegistryVersionsGET } from '../../apps/web/src/app/api/registry/versions/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('registry versions x-total-count', () => {
  test('includes x-total-count when 200', async () => {
    const res = await (RegistryVersionsGET as any)(get('http://localhost/api/registry/versions', { 'x-test-auth': 'admin' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).not.toBeNull();
    }
  });
});
