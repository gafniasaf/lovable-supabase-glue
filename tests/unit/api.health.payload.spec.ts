import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/health payload shape', () => {
  test('returns ok and flags', async () => {
    const res = await (HealthGET as any)(get('http://localhost/api/health'));
    expect([200]).toContain(res.status);
    const json = await res.json();
    expect(json).toHaveProperty('ok');
    expect(json).toHaveProperty('flags');
  });
});


