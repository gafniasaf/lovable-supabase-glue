import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { POST as PostAssessment } from '../../apps/web/src/app/api/ef/assessments/route';
import { POST as PostEvaluation } from '../../apps/web/src/app/api/ef/evaluations/route';

function post(url: string, body: any, headers?: Record<string,string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('EF API routes (feature-flagged)', () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = { ...original, TEST_MODE: '1', FEATURES_EXPERTFOLIO: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost:3022' } as any;
    // simulate role header store like other tests
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });
  afterEach(() => { process.env = original; });

  it('assessments POST 200 happy path', async () => {
    const res = await (PostAssessment as any)(post('http://localhost/api/ef/assessments', { programId: 'p1', epaId: 'e1' }, { origin: 'http://localhost:3022', referer: 'http://localhost:3022/x' }));
    expect([200,201]).toContain(res.status);
    const json = await res.json();
    expect(json.id).toBeTruthy();
    expect(json.status).toBe('submitted');
  });

  it('evaluations POST 200 happy path', async () => {
    // first create an assessment
    const a = await (PostAssessment as any)(post('http://localhost/api/ef/assessments', { programId: 'p1', epaId: 'e1' }, { origin: 'http://localhost:3022', referer: 'http://localhost:3022/x' }));
    const aj = await a.json();
    const res = await (PostEvaluation as any)(post('http://localhost/api/ef/evaluations', { assessmentId: aj.id, outcome: 'approved' }, { origin: 'http://localhost:3022', referer: 'http://localhost:3022/x' }));
    expect([200,201]).toContain(res.status);
    const json = await res.json();
    expect(json.outcome).toBe('approved');
  });

  it('401 when no user', async () => {
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.delete('x-test-auth');
    const res = await (PostAssessment as any)(post('http://localhost/api/ef/assessments', { programId: 'p1', epaId: 'e1' }, { origin: 'http://localhost:3022', referer: 'http://localhost:3022/x' }));
    expect(res.status).toBe(401);
  });

  it('400 on invalid payload', async () => {
    const res = await (PostEvaluation as any)(post('http://localhost/api/ef/evaluations', { assessmentId: 1, outcome: 'nope' }, { origin: 'http://localhost:3022', referer: 'http://localhost:3022/x' } as any));
    expect(res.status).toBe(400);
  });
});


