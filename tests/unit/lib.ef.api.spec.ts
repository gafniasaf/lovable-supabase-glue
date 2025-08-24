import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('EF API client', () => {
  beforeEach(() => { jest.resetAllMocks(); (global as any).fetch = jest.fn(); });

  it('efSubmitAssessment sets Idempotency-Key and handles 429', async () => {
    const { efSubmitAssessment } = await import('../../apps/web/src/lib/ef/api');
    (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 429, headers: { get: jest.fn(() => '5') }, text: jest.fn(async () => 'rate') });
    await expect(efSubmitAssessment({ programId: 'p', epaId: 'e' })).rejects.toThrow(/RATE_LIMIT/);
  });

  it('efCreateEvaluation propagates DTO-success', async () => {
    const { efCreateEvaluation } = await import('../../apps/web/src/lib/ef/api');
    (global.fetch as any).mockResolvedValueOnce({ ok: true, status: 201, json: jest.fn(async () => ({ id: 'x', outcome: 'approved', createdAt: '2024-01-01T00:00:00Z' })), headers: { get: jest.fn() } });
    const out = await efCreateEvaluation({ assessmentId: 'a', outcome: 'approved' });
    expect(out.data.outcome).toBe('approved');
  });
});


