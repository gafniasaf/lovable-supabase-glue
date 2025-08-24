import { getRouteHandlerSupabase } from '@/lib/supabaseServer';
import { resolveTenantFromHostOrPrefix } from '@/lib/tenant';

export async function createAssessmentDb(input: { programId: string; epaId: string; userId: string; req?: Request }) {
  const supabase = getRouteHandlerSupabase();
  const ctx = resolveTenantFromHostOrPrefix((input as any).req || new Request('http://localhost/'));
  const row = {
    tenant_id: ctx.tenantId,
    product: ctx.product === 'expertfolio' ? 'expertfolio' : 'education',
    program_id: input.programId,
    trainee_id: input.userId,
    supervisor_id: input.userId,
    epa_id: input.epaId,
    body: null
  } as any;
  const { data } = await (supabase as any).from('assessments').insert(row).single();
  try {
    await (supabase as any).from('notifications').insert({
      user_id: input.userId,
      type: 'ef.assessment.submitted',
      payload: { programId: input.programId, epaId: input.epaId }
    });
  } catch {}
  const id = (data?.id as string) || crypto.randomUUID();
  const submitted_at = (data?.submitted_at as string) || new Date().toISOString();
  return {
    id,
    programId: input.programId,
    epaId: input.epaId,
    status: 'submitted' as const,
    submittedAt: submitted_at
  };
}

export async function createEvaluationDb(input: { assessmentId: string; outcome: 'approved'|'rejected'|'needs_changes'; comments?: string; userId: string; req?: Request }) {
  const supabase = getRouteHandlerSupabase();
  const ctx = resolveTenantFromHostOrPrefix((input as any).req || new Request('http://localhost/'));
  const row = {
    tenant_id: ctx.tenantId,
    product: ctx.product === 'expertfolio' ? 'expertfolio' : 'education',
    assessment_id: input.assessmentId,
    evaluator_id: input.userId,
    outcome: input.outcome,
    comments: input.comments ?? null
  } as any;
  const { data } = await (supabase as any).from('evaluations').insert(row).single();
  try {
    await (supabase as any).from('notifications').insert({
      user_id: input.userId,
      type: 'ef.evaluation.created',
      payload: { assessmentId: input.assessmentId, outcome: input.outcome }
    });
  } catch {}
  const id = (data?.id as string) || crypto.randomUUID();
  const created_at = (data?.created_at as string) || new Date().toISOString();
  return {
    id,
    assessmentId: input.assessmentId,
    outcome: input.outcome,
    comments: input.comments,
    createdAt: created_at
  };
}


