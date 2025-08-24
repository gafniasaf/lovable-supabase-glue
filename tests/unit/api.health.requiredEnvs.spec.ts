import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('health requiredEnvs shape', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('includes requiredEnvs and flags', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const res = await (HealthGET as any)(get('http://localhost/api/health'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json && typeof json === 'object').toBeTruthy();
    expect(json.requiredEnvs && typeof json.requiredEnvs === 'object').toBeTruthy();
    expect(json.flags && typeof json.flags === 'object').toBeTruthy();
  });
});


