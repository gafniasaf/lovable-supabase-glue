import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('EF Read API routes (DTO-validated)', () => {
  beforeEach(() => { jest.resetModules(); });

  it('POST /api/ef/read/trainee returns DTO-validated payload', async () => {
    const sample = { traineeId: 't1', programId: 'p1', items: [ { epaId: 'e1', completed: 1, pending: 0, lastEvaluationAt: '2024-01-01T00:00:00Z' } ] };
    jest.doMock('../../apps/web/src/server/services/expertfolio.read', () => ({
      getTraineeEpaProgress: async () => sample
    }));
    const mod = await import('../../apps/web/src/app/api/ef/read/trainee/route');
    const req = new Request('http://localhost/api/ef/read/trainee', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ traineeId: 't1', programId: 'p1' }) } as any);
    const res = await (mod.POST as any)(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.traineeId).toBe('t1');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('POST /api/ef/read/supervisor returns DTO-validated payload', async () => {
    const sample = { supervisorId: 's1', items: [ { assessmentId: 'a1', traineeId: 't1', programId: 'p1', epaId: 'e1', submittedAt: '2024-01-01T00:00:00Z' } ] };
    jest.doMock('../../apps/web/src/server/services/expertfolio.read', () => ({
      getSupervisorQueue: async () => sample
    }));
    const mod = await import('../../apps/web/src/app/api/ef/read/supervisor/route');
    const req = new Request('http://localhost/api/ef/read/supervisor', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ supervisorId: 's1' }) } as any);
    const res = await (mod.POST as any)(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.supervisorId).toBe('s1');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('POST /api/ef/read/program returns DTO-validated payload', async () => {
    const sample = { programId: 'p1', epaCount: 2, traineeCount: 5, recentEvaluations: [ { id: 'v1', outcome: 'approved', createdAt: '2024-01-01T00:00:00Z' } ] };
    jest.doMock('../../apps/web/src/server/services/expertfolio.read', () => ({
      getProgramOverview: async () => sample
    }));
    const mod = await import('../../apps/web/src/app/api/ef/read/program/route');
    const req = new Request('http://localhost/api/ef/read/program', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ programId: 'p1' }) } as any);
    const res = await (mod.POST as any)(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.programId).toBe('p1');
    expect(Array.isArray(body.recentEvaluations)).toBe(true);
  });
});


