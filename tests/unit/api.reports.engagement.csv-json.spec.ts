import { GET as EngagementGET } from '../../apps/web/src/app/api/reports/engagement/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('reports engagement CSV/JSON', () => {
  test('JSON returns 200 or 401/403', async () => {
    const res = await (EngagementGET as any)(get('http://localhost/api/reports/engagement?course_id=11111111-1111-1111-1111-111111111111', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/application\/json/);
    }
  });

  test('CSV returns text/csv when requested', async () => {
    const res = await (EngagementGET as any)(get('http://localhost/api/reports/engagement?course_id=11111111-1111-1111-1111-111111111111&format=csv', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});
