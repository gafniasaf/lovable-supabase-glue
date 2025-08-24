import { describe, it, expect, beforeEach } from '@jest/globals';
import { traineeEpaProgressDto, supervisorQueueDto, programOverviewDto } from '../../packages/shared/src/schemas/expertfolio';

describe('EF read-model DTOs', () => {
  beforeEach(() => { jest.resetModules(); });

  it('trainee progress DTO validates shape and counts', () => {
    const sample = {
      traineeId: 't1',
      programId: 'p1',
      items: [ { epaId: 'e1', completed: 2, pending: 1, lastEvaluationAt: '2024-01-01T00:00:00Z' } ]
    };
    const parsed = traineeEpaProgressDto.parse(sample);
    expect(parsed.items[0].completed + parsed.items[0].pending).toBeGreaterThanOrEqual(0);
  });

  it('supervisor queue DTO validates items', () => {
    const sample = {
      supervisorId: 's1',
      items: [ { assessmentId: 'a1', traineeId: 't1', programId: 'p1', epaId: 'e1', submittedAt: '2024-01-01T00:00:00Z' } ]
    };
    const parsed = supervisorQueueDto.parse(sample);
    expect(parsed.items.length).toBe(1);
  });

  it('program overview validates recent evaluations list', () => {
    const sample = {
      programId: 'p1',
      epaCount: 3,
      traineeCount: 10,
      recentEvaluations: [ { id: 'v1', outcome: 'approved', createdAt: '2024-01-01T00:00:00Z' } ]
    };
    const parsed = programOverviewDto.parse(sample);
    expect(parsed.recentEvaluations[0].id).toBe('v1');
  });
});

import { describe, it, expect } from '@jest/globals';
import { traineeEpaProgressDto, supervisorQueueDto, programOverviewDto } from '@education/shared';

describe('ExpertFolio read-model DTOs', () => {
  it('validates trainee progress', () => {
    const ok = traineeEpaProgressDto.parse({ traineeId: 't1', programId: 'p1', items: [] });
    expect(ok.items.length).toBe(0);
    expect(() => traineeEpaProgressDto.parse({ traineeId: 't1', programId: 'p1', items: [{}] as any })).toThrow();
  });
  it('validates supervisor queue', () => {
    const ok = supervisorQueueDto.parse({ supervisorId: 's1', items: [] });
    expect(ok.items).toEqual([]);
  });
  it('validates program overview', () => {
    const ok = programOverviewDto.parse({ programId: 'p1', epaCount: 2, traineeCount: 10, recentEvaluations: [] });
    expect(ok.traineeCount).toBe(10);
    expect(() => programOverviewDto.parse({ programId: 'p1', epaCount: -1, traineeCount: 0 } as any)).toThrow();
  });
});


