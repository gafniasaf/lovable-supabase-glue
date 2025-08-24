import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseQuery } from "@/lib/zodQuery";
import { jsonDto } from "@/lib/jsonDto";

const qSchema = z.object({ from: z.string().optional(), to: z.string().optional(), course_id: z.string().uuid().optional(), limit: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  // Per-user rate limit
  {
    const limit = Number(process.env.REPORTS_ACTIVITY_LIMIT || 240);
    const windowMs = Number(process.env.REPORTS_ACTIVITY_WINDOW_MS || 60000);
    if (limit > 0) {
      const rl = checkRateLimit(`reports:activity:${user.id}`, limit, windowMs);
      if (!rl.allowed) {
        const retry = Math.max(0, rl.resetAt - Date.now());
        return NextResponse.json(
          { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
          { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
        );
      }
    }
  }
  let q: z.infer<typeof qSchema>;
  try { q = parseQuery(req, qSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const supabase = getRouteHandlerSupabase();
  let builder: any = supabase.from('events').select('id,user_id,event_type,entity_type,entity_id,ts').order('ts', { ascending: false });
  if (q.from) builder = builder.gte('ts', q.from);
  if (q.to) builder = builder.lte('ts', q.to);
  if (q.course_id) builder = builder.eq('entity_type', 'course').eq('entity_id', q.course_id);
  const limit = Math.max(1, Math.min(500, parseInt(q.limit || '100', 10) || 100));
  builder = builder.limit(limit);
  const { data, error } = await builder;
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const dto = z.array(z.object({ id: z.string().uuid(), user_id: z.string().nullable(), event_type: z.string(), entity_type: z.string(), entity_id: z.string(), ts: z.string() }));
  return jsonDto((data ?? []) as any, dto as any, { requestId, status: 200 });
});


