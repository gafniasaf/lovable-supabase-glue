describe('Epic H: Files and Media', () => {
  test('issues an upload URL for a given owner and content type', async () => {
    process.env.TEST_MODE = '1';
    const mod = await import('../../apps/web/src/app/api/files/upload-url/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await mod.POST(new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ owner_type: 'assignment', owner_id: 'a1', content_type: 'text/plain' }) }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain('/api/files/upload-url');
  });

  test('accepts PUT upload and returns a public download URL, then serves bytes', async () => {
    process.env.TEST_MODE = '1';
    const mod = await import('../../apps/web/src/app/api/files/upload-url/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const res = await mod.PUT(new Request('http://localhost/api/files/upload-url?owner_type=assignment&owner_id=a1&content_type=text/plain', { method: 'PUT', headers: { 'x-test-auth': 'teacher' }, body: new TextEncoder().encode('hello') }) as any);
    expect(res.status).toBe(200);
    const { id, url } = await res.json();
    expect(id).toBeTruthy();
    const dl = await import('../../apps/web/src/app/api/files/download-url/route');
    const dres = await dl.GET(new Request(`http://localhost${url}`, { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(dres.status).toBe(200);
    expect(dres.headers.get('content-type')).toBe('text/plain');
  });

  test('enforces auth on upload and download routes', async () => {
    // clear any prior test auth cookie/header
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.headers?.clear?.();
    const up = await import('../../apps/web/src/app/api/files/upload-url/route');
    const noAuthUpload = await up.POST(new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ owner_type: 'assignment', owner_id: 'a1' }) }) as any);
    expect(noAuthUpload.status).toBe(401);
    const dl = await import('../../apps/web/src/app/api/files/download-url/route');
    const noAuthDownload = await dl.GET(new Request('http://localhost/api/files/download-url?id=x') as any);
    expect(noAuthDownload.status).toBe(401);
  });

  test('download-url requires id: returns 400 when missing', async () => {
    const dl = await import('../../apps/web/src/app/api/files/download-url/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await dl.GET(new Request('http://localhost/api/files/download-url') as any);
    expect(res.status).toBe(400);
  });
});


