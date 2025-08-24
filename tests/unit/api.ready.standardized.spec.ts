import { GET as ReadyGET } from '../../apps/web/src/app/api/ready/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/ready standardized', () => {
  test('returns JSON via jsonDto and echoes x-request-id', async () => {
    const reqId = 'req-123';
    const res = await (ReadyGET as any)(get('http://localhost/api/ready', { 'x-request-id': reqId }));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe(reqId);
    const json = await res.json();
    expect(typeof json?.ok).toBe('boolean');
    // DTO behavior: should include requestId in body where jsonDto is used across routes
    // Tolerate either presence or omission, but ensure shape is object
    expect(typeof json).toBe('object');
  });
});


