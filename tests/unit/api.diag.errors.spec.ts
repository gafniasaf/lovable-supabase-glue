import { describe, it, expect, beforeEach } from '@jest/globals';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers: headers as any });
}
function post(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'POST', headers: headers as any });
}

describe('diag errors route', () => {
  beforeEach(() => {
    jest.resetModules();
    (process.env as any).TEST_MODE = '1';
    delete (process.env as any).E2E_ALLOW_TEST_MODE;
  });

  it('rejects without admin header', async () => {
    const mod = await import('../../apps/web/src/app/api/diag/errors/route');
    const res = await (mod.GET as any)(get('http://localhost/api/diag/errors'));
    expect(res.status).toBe(403);
  });

  it('returns empty list initially with admin header', async () => {
    const mod = await import('../../apps/web/src/app/api/diag/errors/route');
    const res = await (mod.GET as any)(get('http://localhost/api/diag/errors?n=5', { 'x-admin-diag': '1' }));
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('supports CSV output', async () => {
    const mod = await import('../../apps/web/src/app/api/diag/errors/route');
    const res = await (mod.GET as any)(get('http://localhost/api/diag/errors?n=5&format=csv', { 'x-admin-diag': '1' }));
    expect(res.ok).toBeTruthy();
    expect(res.headers.get('content-type') || '').toContain('text/csv');
  });

  it('clears via POST clear=1', async () => {
    const mod = await import('../../apps/web/src/app/api/diag/errors/route');
    const res = await (mod.POST as any)(post('http://localhost/api/diag/errors?clear=1', { 'x-admin-diag': '1' }));
    expect(res.ok).toBeTruthy();
    const body = await res.json();
    expect(body.cleared).toBe(true);
  });

  it('paginates results and returns page info', async () => {
    const mod = await import('../../apps/web/src/app/api/diag/errors/route');
    // First fetch page
    let res = await (mod.GET as any)(get('http://localhost/api/diag/errors?n=1&levels=all', { 'x-admin-diag': '1' }));
    let body = await res.json();
    expect(body.page).toBeTruthy();
    const next = body.page.nextOffset;
    res = await (mod.GET as any)(get(`http://localhost/api/diag/errors?n=1&levels=all&offset=${next}`, { 'x-admin-diag': '1' }));
    body = await res.json();
    if (next == null) {
      expect(body.page.hasMore).toBe(false);
    } else {
      expect(body.page.offset).toBe(next);
    }
  });
});
