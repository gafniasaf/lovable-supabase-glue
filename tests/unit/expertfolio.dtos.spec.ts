import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  assessmentCreateRequest,
  assessmentResponse,
  evaluationCreateRequest,
  evaluationResponse,
} from '@education/shared';

describe('ExpertFolio DTOs', () => {
  it('assessmentCreateRequest: accepts valid and rejects extras', () => {
    const ok = assessmentCreateRequest.parse({ programId: 'p1', epaId: 'e1' });
    expect(ok.programId).toBe('p1');
    expect(() => assessmentCreateRequest.parse({ programId: 'p1', epaId: 'e1', extra: 'x' } as any)).toThrow();
    expect(() => assessmentCreateRequest.parse({ programId: 1 as any, epaId: 'e1' })).toThrow();
  });

  it('assessmentResponse: strict shape', () => {
    const now = new Date().toISOString();
    const ok = assessmentResponse.parse({ id: 'a1', programId: 'p1', epaId: 'e1', status: 'submitted', submittedAt: now });
    expect(ok.status).toBe('submitted');
    expect(() => assessmentResponse.parse({ id: 'a1', programId: 'p1', epaId: 'e1', status: 'submitted', submittedAt: now, extra: true } as any)).toThrow();
    expect(() => assessmentResponse.parse({ id: 'a1', programId: 'p1', epaId: 'e1', status: 'other' as any, submittedAt: now })).toThrow();
  });

  it('evaluationCreateRequest: accepts valid and rejects extras', () => {
    const ok = evaluationCreateRequest.parse({ assessmentId: 'a1', outcome: 'approved' });
    expect(ok.outcome).toBe('approved');
    expect(() => evaluationCreateRequest.parse({ assessmentId: 'a1', outcome: 'nope' as any })).toThrow();
    expect(() => evaluationCreateRequest.parse({ assessmentId: 'a1', outcome: 'approved', extra: 1 } as any)).toThrow();
  });

  it('evaluationResponse: strict shape', () => {
    const now = new Date().toISOString();
    const ok = evaluationResponse.parse({ id: 'e1', assessmentId: 'a1', outcome: 'rejected', createdAt: now });
    expect(z.string().parse(ok.createdAt)).toBe(now);
    expect(() => evaluationResponse.parse({ id: 'e1', assessmentId: 'a1', outcome: 'rejected', createdAt: now, extra: 'x' } as any)).toThrow();
  });
});


