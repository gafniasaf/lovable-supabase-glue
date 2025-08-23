import { z } from 'zod';
import { isTestMode } from '@/lib/testMode';

export type EfGateway = {
  getTraineeProgress(input: { traineeId: string; programId: string }): Promise<{ traineeId: string; programId: string; items: Array<{ epaId: string; completed: number; pending: number; lastEvaluationAt?: string }> }>;
  getSupervisorQueue(input: { supervisorId: string }): Promise<{ supervisorId: string; items: Array<{ assessmentId: string; traineeId: string; programId: string; epaId: string; submittedAt: string }> }>;
  getProgramOverview(input: { programId: string }): Promise<{ programId: string; epaCount: number; traineeCount: number; recentEvaluations: Array<{ id: string; outcome: 'approved'|'rejected'|'needs_changes'; createdAt: string }> }>;
};

async function postJson<T>(path: string, schema: z.ZodTypeAny, body: any): Promise<T> {
  const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || '');
  const res = await fetch(`${origin}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store' } as any);
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return schema.parse(json) as T;
}

export function createEfGateway(): EfGateway {
  const traineeSchema = z.object({ traineeId: z.string(), programId: z.string(), items: z.array(z.object({ epaId: z.string(), completed: z.number(), pending: z.number(), lastEvaluationAt: z.string().optional() })) });
  const supervisorSchema = z.object({ supervisorId: z.string(), items: z.array(z.object({ assessmentId: z.string(), traineeId: z.string(), programId: z.string(), epaId: z.string(), submittedAt: z.string() })) });
  const programSchema = z.object({ programId: z.string(), epaCount: z.number(), traineeCount: z.number(), recentEvaluations: z.array(z.object({ id: z.string(), outcome: z.enum(['approved','rejected','needs_changes']), createdAt: z.string() })) });
  return {
    async getTraineeProgress(input) { return postJson('/api/ef/read/trainee', traineeSchema, input); },
    async getSupervisorQueue(input) { return postJson('/api/ef/read/supervisor', supervisorSchema, input); },
    async getProgramOverview(input) { return postJson('/api/ef/read/program', programSchema, input); }
  };
}


