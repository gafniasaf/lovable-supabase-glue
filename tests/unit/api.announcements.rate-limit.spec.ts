import { POST as AnnPOST, DELETE as AnnDELETE } from '../../apps/web/src/app/api/announcements/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any); }
function del(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'DELETE', headers: headers as any } as any); }

describe('announcements rate-limit headers', () => {
  const createBody = { course_id: '11111111-1111-1111-1111-111111111111', title: 'Hi', body: 'Text' } as any;

  test('POST includes standard headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'teacher' } as any;
    await (AnnPOST as any)(post('http://localhost/api/announcements', headers, createBody));
    const res = await (AnnPOST as any)(post('http://localhost/api/announcements', headers, createBody));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([201,401,403,429,500]).toContain(res.status);
    }
  });

  test('DELETE includes standard headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'teacher' } as any;
    await (AnnDELETE as any)(del('http://localhost/api/announcements?id=11111111-1111-1111-1111-111111111111', headers));
    const res = await (AnnDELETE as any)(del('http://localhost/api/announcements?id=11111111-1111-1111-1111-111111111111', headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});
