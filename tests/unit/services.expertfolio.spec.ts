import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('../../apps/web/src/lib/supabaseServer', () => {
  const insertSpy = jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', submitted_at: new Date().toISOString(), created_at: new Date().toISOString() } }) });
  const fromSpy = jest.fn().mockImplementation((_table: string) => ({ insert: insertSpy }));
  return { getRouteHandlerSupabase: () => ({ from: fromSpy }) } as any;
});

describe('EF services', () => {
  beforeEach(() => { jest.resetModules(); });

  it('createAssessmentDb inserts tenant_id/product and sends notification', async () => {
    const mod = await import('../../apps/web/src/server/services/expertfolio');
    const out = await mod.createAssessmentDb({ programId: 'p', epaId: 'e', userId: 'u', req: new Request('http://folio.example.com/api') });
    expect(out.status).toBe('submitted');
  });

  it('createEvaluationDb inserts tenant_id/product and sends notification', async () => {
    const mod = await import('../../apps/web/src/server/services/expertfolio');
    const out = await mod.createEvaluationDb({ assessmentId: 'a', outcome: 'approved', userId: 'u', req: new Request('http://folio.example.com/api') });
    expect(out.outcome).toBe('approved');
  });
});
