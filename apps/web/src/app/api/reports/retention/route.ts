import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseQuery } from "@/lib/zodQuery";
import { jsonDto } from "@/lib/jsonDto";

const qSchema = z.object({ from: z.string().optional(), to: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  // Per-user rate limit
  {
    const limit = Number(process.env.REPORTS_RETENTION_LIMIT || 120);
    const windowMs = Number(process.env.REPORTS_RETENTION_WINDOW_MS || 60000);
    if (limit > 0) {
      const rl = checkRateLimit(`reports:retention:${user.id}`, limit, windowMs);
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
  let builder: any = supabase.from('daily_active_users').select('day,dau').order('day', { ascending: true });
  if (q.from) builder = builder.gte('day', q.from);
  if (q.to) builder = builder.lte('day', q.to);
  const { data, error } = await builder;
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const dto = z.array(z.object({ day: z.string(), dau: z.number().int().nonnegative() }));
  return jsonDto((data ?? []) as any, dto as any, { requestId, status: 200 });
});


