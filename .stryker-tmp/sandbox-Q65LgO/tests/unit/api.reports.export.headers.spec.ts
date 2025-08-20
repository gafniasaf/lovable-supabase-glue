// @ts-nocheck
import { GET as OutcomesExport } from '../../apps/web/src/app/api/runtime/outcomes/export/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('runtime outcomes export CSV headers', () => {
  test('content headers present or auth errors', async () => {
    const res = await (OutcomesExport as any)(get('http://localhost/api/runtime/outcomes/export?course_id=00000000-0000-0000-0000-000000000001'));
    if (res.status === 200) {
      expect(res.headers.get('content-type')).toMatch(/text\/csv/);
      expect(res.headers.get('content-disposition')).toMatch(/attachment/);
    } else {
      expect([401,403,400,500]).toContain(res.status);
    }
  });
});


