import { describe, it, expect, beforeEach } from '@jest/globals';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('EF idempotency and rate limit', () => {
  beforeEach(() => { jest.resetModules(); (process.env as any).TEST_MODE = '1'; });

  it('same Idempotency-Key returns same response', async () => {
    const { POST } = await import('../../apps/web/src/app/api/ef/assessments/route');
    const h = { 'x-test-auth': 'teacher', 'origin': 'http://localhost:3022', 'referer': 'http://localhost:3022/x', 'idempotency-key': 'k1' } as any;
    const req1 = post('http://localhost/api/ef/assessments', { programId: 'p', epaId: 'e' }, h);
    const req2 = post('http://localhost/api/ef/assessments', { programId: 'p', epaId: 'e' }, h);
    const r1 = await (POST as any)(req1);
    const r2 = await (POST as any)(req2);
    expect(r1.status).toBe(201);
    expect((await r1.text())).toBe(await r2.text());
  });

  it('rate limits EF assessment creation after threshold', async () => {
    (process.env as any).EF_CREATE_RATE_LIMIT = '2';
    (process.env as any).EF_CREATE_RATE_WINDOW_MS = '60000';
    const { POST } = await import('../../apps/web/src/app/api/ef/assessments/route');
    const h = { 'x-test-auth': 'teacher', 'origin': 'http://localhost:3022', 'referer': 'http://localhost:3022/x' } as any;
    const req = () => post('http://localhost/api/ef/assessments', { programId: 'p', epaId: 'e' }, h);
    const r1 = await (POST as any)(req());
    const r2 = await (POST as any)(req());
    const r3 = await (POST as any)(req());
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(r3.status).toBe(429);
  });
});


