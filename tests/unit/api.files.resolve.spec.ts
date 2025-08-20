import { POST as ResolvePOST } from '../../apps/web/src/app/api/files/resolve/route';

function makePost(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/files/resolve', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}

describe('API /api/files/resolve', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth → 401 with x-request-id', async () => {
    const res = await (ResolvePOST as any)(makePost({ keys: ['k1'] }));
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('invalid payload → 400 Problem', async () => {
    const res = await (ResolvePOST as any)(makePost({}));
    expect(res.status).toBe(400);
  });

  test('test-mode: returns mapping for keys with signed download-url', async () => {
    const res = await (ResolvePOST as any)(makePost({ keys: ['abc', 'x y', 'z/1'] }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json['abc'].url).toBe('/api/files/download-url?id=abc');
    expect(json['x y'].url).toBe('/api/files/download-url?id=x%20y');
    expect(json['z/1'].url).toBe('/api/files/download-url?id=z%2F1');
    expect(json['abc'].filename).toBeNull();
    expect(json['abc'].content_type).toBeNull();
  });
});


