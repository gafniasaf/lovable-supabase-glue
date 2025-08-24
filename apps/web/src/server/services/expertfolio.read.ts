import { getRouteHandlerSupabase } from '@/lib/supabaseServer';
import { resolveTenantFromHostOrPrefix } from '@/lib/tenant';
import { traineeEpaProgressDto, supervisorQueueDto, programOverviewDto } from '@education/shared';

export async function getTraineeEpaProgress(req: Request, traineeId: string, programId: string) {
  const { tenantId, product } = resolveTenantFromHostOrPrefix(req);
  const supabase = getRouteHandlerSupabase();
  // Aggregate pending/completed counts. Placeholder queries (optimize as needed).
  const { data: evals } = await (supabase as any)
    .from('evaluations')
    .select('assessment_id, outcome, created_at, assessments:assessment_id(epa_id, trainee_id, program_id, tenant_id, product)')
    .eq('assessments.tenant_id', tenantId)
    .eq('assessments.product', product)
    .eq('assessments.trainee_id', traineeId)
    .eq('assessments.program_id', programId);
  const itemsMap = new Map<string, { epaId: string; completed: number; pending: number; lastEvaluationAt?: string }>();
  for (const row of (evals || [])) {
    const epaId = row.assessments?.epa_id as string;
    if (!epaId) continue;
    const cur = itemsMap.get(epaId) || { epaId, completed: 0, pending: 0 };
    cur.completed += (row.outcome === 'approved' ? 1 : 0);
    const ts = row.created_at as string | undefined;
    if (ts) cur.lastEvaluationAt = ts;
    itemsMap.set(epaId, cur);
  }
  const items = Array.from(itemsMap.values());
  const dto = traineeEpaProgressDto.parse({ traineeId, programId, items });
  return dto;
}

export async function getSupervisorQueue(req: Request, supervisorId: string) {
  const { tenantId, product } = resolveTenantFromHostOrPrefix(req);
  const supabase = getRouteHandlerSupabase();
  const { data: rows } = await (supabase as any)
    .from('assessments')
    .select('id, trainee_id, program_id, epa_id, submitted_at')
    .eq('tenant_id', tenantId)
    .eq('product', product)
    .order('submitted_at', { ascending: false })
    .limit(50);
  const items = (rows || []).map((r: any) => ({ assessmentId: r.id, traineeId: r.trainee_id, programId: r.program_id, epaId: r.epa_id, submittedAt: r.submitted_at }));
  const dto = supervisorQueueDto.parse({ supervisorId, items });
  return dto;
}

export async function getProgramOverview(req: Request, programId: string) {
  const { tenantId, product } = resolveTenantFromHostOrPrefix(req);
  const supabase = getRouteHandlerSupabase();
  const { count: traineeCount } = await (supabase as any)
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('product', product)
    .eq('program_id', programId);
  const { count: epaCount } = await (supabase as any)
    .from('program_epa_map')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .eq('product', product)
    .eq('program_id', programId);
  const { data: recent } = await (supabase as any)
    .from('evaluations')
    .select('id, outcome, created_at, tenant_id, product, assessments:assessment_id(program_id)')
    .eq('tenant_id', tenantId)
    .eq('product', product)
    .order('created_at', { ascending: false })
    .limit(10);
  const recentEvaluations = (recent || []).map((r: any) => ({ id: r.id, outcome: r.outcome, createdAt: r.created_at }));
  const dto = programOverviewDto.parse({ programId, epaCount: epaCount || 0, traineeCount: traineeCount || 0, recentEvaluations });
  return dto;
}


