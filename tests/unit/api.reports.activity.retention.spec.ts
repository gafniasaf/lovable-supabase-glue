import { GET as ActivityGET } from '../../apps/web/src/app/api/reports/activity/route';
import { GET as RetentionGET } from '../../apps/web/src/app/api/reports/retention/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('reports activity and retention JSON', () => {
  test('activity returns 200 or auth errors', async () => {
    const res = await (ActivityGET as any)(get('http://localhost/api/reports/activity?limit=10', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
    }
  });

  test('retention returns 200 or auth errors', async () => {
    const res = await (RetentionGET as any)(get('http://localhost/api/reports/retention', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
    }
  });
});
