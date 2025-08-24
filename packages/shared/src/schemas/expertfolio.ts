import { z } from 'zod';

export const assessmentCreateRequest = z.object({
  programId: z.string().min(1),
  epaId: z.string().min(1),
  body: z.string().min(1).optional()
}).strict();

export const assessmentResponse = z.object({
  id: z.string().min(1),
  programId: z.string().min(1),
  epaId: z.string().min(1),
  status: z.literal('submitted'),
  submittedAt: z.string().min(1)
}).strict();

export const evaluationCreateRequest = z.object({
  assessmentId: z.string().min(1),
  outcome: z.enum(['approved','rejected','needs_changes']),
  comments: z.string().min(1).optional()
}).strict();

export const evaluationResponse = z.object({
  id: z.string().min(1),
  assessmentId: z.string().min(1),
  outcome: z.enum(['approved','rejected','needs_changes']),
  comments: z.string().min(1).optional(),
  createdAt: z.string().min(1)
}).strict();

// Read-model DTOs
export const traineeEpaProgressDto = z.object({
  traineeId: z.string().min(1),
  programId: z.string().min(1),
  items: z.array(z.object({ epaId: z.string().min(1), completed: z.number().int().min(0), pending: z.number().int().min(0), lastEvaluationAt: z.string().optional() })).default([])
}).strict();

export const supervisorQueueItemDto = z.object({
  assessmentId: z.string().min(1),
  traineeId: z.string().min(1),
  programId: z.string().min(1),
  epaId: z.string().min(1),
  submittedAt: z.string().min(1)
}).strict();
export const supervisorQueueDto = z.object({ supervisorId: z.string().min(1), items: z.array(supervisorQueueItemDto) }).strict();

export const programOverviewDto = z.object({
  programId: z.string().min(1),
  epaCount: z.number().int().min(0),
  traineeCount: z.number().int().min(0),
  recentEvaluations: z.array(z.object({ id: z.string().min(1), outcome: z.enum(['approved','rejected','needs_changes']), createdAt: z.string().min(1) })).default([])
}).strict();


