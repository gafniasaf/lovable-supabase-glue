// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { outcomeRequest } from "@education/shared";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { isInteractiveRuntimeEnabled } from "@/lib/testMode";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRequestLogger } from "@/lib/logger";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const body = await req.json().catch(() => ({}));
  const parsed = outcomeRequest.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  if (!isInteractiveRuntimeEnabled()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Interactive runtime disabled' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  // Rate limit per course/provider
  const courseId = parsed.data.courseId;
  const rateLimit = checkRateLimit(`webhook:${courseId}`, Number(process.env.RUNTIME_OUTCOMES_LIMIT || 60), Number(process.env.RUNTIME_OUTCOMES_WINDOW_MS || 60000));
  if (!rateLimit.allowed) {
    const retry = Math.max(0, rateLimit.resetAt - Date.now());
    return NextResponse.json(
      { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
      {
        status: 429,
        headers: {
          'x-request-id': requestId,
          'retry-after': String(Math.ceil(retry / 1000)),
          'x-rate-limit-remaining': String(rateLimit.remaining),
          'x-rate-limit-reset': String(Math.ceil(rateLimit.resetAt / 1000))
        }
      }
    );
  }
  const supabase = getRouteHandlerSupabase();
  try {
    const { courseId } = parsed.data;
    const { data: courseRow } = await supabase.from('courses').select('id,provider_id').eq('id', courseId).single();
    if (courseRow && (courseRow as any).provider_id) {
      const { data: provider } = await supabase.from('course_providers').select('jwks_url').eq('id', (courseRow as any).provider_id).single();
      const jwksUrl = (provider as any)?.jwks_url as string | undefined;
      if (jwksUrl && !isTestMode()) {
        const auth = req.headers.get('authorization') || req.headers.get('x-provider-jwt') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
        if (!token) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Missing provider token' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
        try {
          const { verifyJwtWithJwks } = await import('@/lib/jwksCache');
          const payload = await verifyJwtWithJwks(token, jwksUrl);
          // Optional: validate payload.courseId and payload.userId if present
          if (payload && payload.courseId && payload.courseId !== parsed.data.courseId) {
            return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Token/course mismatch' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
          }
        } catch (e: any) {
          try { (await import('@/lib/metrics')).incrCounter('jwks.verify_fail'); } catch {}
          return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Invalid provider token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        }
      }
    }
  } catch {}
  const ev = parsed.data.event;
  const base = { course_id: parsed.data.courseId, user_id: parsed.data.userId } as any;
  let row: any = null;
  if (ev.type === 'attempt.completed') {
    const { data, error } = await supabase.from('interactive_attempts').insert({ ...base, runtime_attempt_id: ev.runtimeAttemptId ?? null, score: ev.score, max: ev.max, passed: ev.passed }).select().single();
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    row = data;
  } else if (ev.type === 'progress') {
    const { data, error } = await supabase.from('interactive_attempts').insert({ ...base, pct: Math.round(ev.pct), topic: ev.topic ?? null }).select().single();
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    row = data;
  }
  try { getRequestLogger(requestId).info({ courseId: parsed.data.courseId, userId: parsed.data.userId, kind: ev.type }, 'runtime_outcome_saved'); } catch {}
  try {
    const { runtimeAttemptDto } = await import("@education/shared");
    const dto = runtimeAttemptDto.parse(row);
    return NextResponse.json(dto, { status: 201, headers: { 'x-request-id': requestId } });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid outcome shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const qSchema = z.object({ course_id: z.string().uuid(), offset: z.string().optional(), limit: z.string().optional() }).strict();
  let q: { course_id: string; offset?: string; limit?: string };
  try { q = parseQuery(req, qSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const supabase = getRouteHandlerSupabase();
  const offset = Math.max(0, parseInt(q.offset || '0', 10) || 0);
  const limit = Math.max(1, Math.min(200, parseInt(q.limit || '50', 10) || 50));
  const base = supabase
    .from('interactive_attempts')
    .select('*', { count: 'exact' as any }) as any;
  let data: any[] | null = null; let error: any = null; let count: number | null = null;
  try {
    const chained = base.eq ? base.eq('course_id', q.course_id) : base;
    const ordered = chained.order ? chained.order('created_at', { ascending: false }) : chained;
    const resp = await ordered.range(offset, offset + limit - 1);
    data = (resp as any).data ?? null; error = (resp as any).error ?? null; count = (resp as any).count ?? null;
  } catch (e: any) { error = e; }
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  try {
    const { runtimeAttemptListDto } = await import("@education/shared");
    const parsed = runtimeAttemptListDto.parse(data ?? []);
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (typeof count === 'number') headers['x-total-count'] = String(count);
    return NextResponse.json(parsed, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid outcome shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});


