import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('EF files routes', () => {
  beforeEach(() => { jest.resetModules(); });

  it('upload-url enforces allowed MIME and returns presigned URL', async () => {
    jest.doMock('../../apps/web/src/lib/files', () => ({ presignUploadUrl: async () => ({ url: 'http://u', method: 'PUT', headers: { 'content-type': 'image/png' } }) }));
    const mod = await import('../../apps/web/src/app/api/ef/files/upload-url/route');
    const req = new Request('http://localhost/api/ef/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ entity: 'assessment', id: 'a1', filename: 'f.png', contentType: 'image/png' }) } as any);
    const res = await (mod.POST as any)(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeTruthy();
  });

  it('download-url returns signed URL shape', async () => {
    jest.doMock('../../apps/web/src/lib/files', () => ({ presignDownloadUrl: async () => 'http://d' }));
    const mod = await import('../../apps/web/src/app/api/ef/files/download-url/route');
    const req = new Request('http://localhost/api/ef/files/download-url', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ entity: 'assessment', id: 'a1', filename: 'f.png' }) } as any);
    const res = await (mod.POST as any)(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('http://d');
  });
});


