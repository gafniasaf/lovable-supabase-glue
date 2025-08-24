import { NextRequest, NextResponse } from 'next/server';
import { withRouteTiming } from '@/server/withRouteTiming';
import { createApiHandler } from '@/server/apiHandler';
import { isExpertFolioEnabled } from '@/lib/features';
import { getCurrentUserInRoute } from '@/lib/supabaseServer';
import { evaluationCreateRequest, evaluationResponse } from '@education/shared';
import { jsonDto } from '@/lib/jsonDto';
import { createEvaluationDb } from '@/server/services/expertfolio';
import { incrCounter } from '@/lib/metrics';
import { isTestMode } from '@/lib/testMode';
import { createEvaluation } from '@/server/adapters/expertfolio.inproc';

export const runtime = 'nodejs';
export const POST = withRouteTiming(createApiHandler({
  preAuth: async (ctx) => {
    const requestId = ctx.requestId;
    if (!(isTestMode() || process.env.TEST_MODE === '1')) return null;
    if (process.env.E2E_FORCE_DB === '1') return null;
    if (!isExpertFolioEnabled()) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
    }
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    try {
      const raw = await (ctx.req as Request).text();
      const json = JSON.parse(raw || '{}');
      const parsed = evaluationCreateRequest.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
      }
      const payload = { id: crypto.randomUUID(), assessmentId: parsed.data.assessmentId, outcome: parsed.data.outcome, comments: parsed.data.comments, createdAt: new Date().toISOString() } as const;
      const dto = evaluationResponse.parse(payload as any);
      return jsonDto(dto as any, evaluationResponse as any, { requestId, status: 201 });
    } catch {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid JSON' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    }
  },
  schema: evaluationCreateRequest,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    if (!isExpertFolioEnabled()) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
    }
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    // Optional: per-user rate limit symmetry with assessments
    try {
      const windowMs = Number(process.env.EF_CREATE_RATE_WINDOW_MS || 60000);
      const limit = Number(process.env.EF_CREATE_RATE_LIMIT || 0);
      if (limit > 0) {
        const { checkRateLimit } = await import('@/lib/rateLimit');
        const rl = checkRateLimit(`ef_eval:${user.id}`, limit, windowMs);
        if (!rl.allowed) {
          return NextResponse.json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId }, { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil((rl.resetAt - Date.now())/1000)) } });
        }
      }
    } catch {}
    try {
      if (isTestMode() || process.env.TEST_MODE === '1') {
        try { incrCounter('ef.evaluation.create.test'); } catch {}
        const payload = { id: crypto.randomUUID(), assessmentId: input!.assessmentId, outcome: input!.outcome, comments: input!.comments, createdAt: new Date().toISOString() } as const;
        const dto = evaluationResponse.parse(payload as any);
        return jsonDto(dto as any, evaluationResponse as any, { requestId, status: 201 });
      }
      const data = await createEvaluationDb({ assessmentId: input!.assessmentId, outcome: input!.outcome, comments: input!.comments, userId: user.id, req: ctx.req as any });
      try { incrCounter('ef.evaluation.create.ok'); } catch {}
      const dto = evaluationResponse.parse(data);
      return jsonDto(dto as any, evaluationResponse as any, { requestId, status: 201 });
    } catch (e: any) {
      try { incrCounter('ef.evaluation.create.err'); } catch {}
      if (isTestMode()) {
        return NextResponse.json({ error: { code: 'INTERNAL', message: e?.message || 'ef_evaluation_error' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
      }
      throw e;
    }
  }
}));


