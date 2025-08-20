// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const qSchema = z.object({ limit: z.string().optional() }).strict();
  let q: { limit?: string };
  try {
    q = parseQuery(req, qSchema);
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const limit = Math.max(1, Math.min(500, parseInt(q.limit || '200', 10) || 200));
  const supabase = getRouteHandlerSupabase();
  const query = supabase
    .from('audit_logs')
    .select('id,actor_id,action,entity_type,entity_id,details,created_at') as any;
  let data: any[] | null = null; let error: any = null;
  try {
    const orderFn = (query as any).order;
    if (typeof orderFn === 'function') {
      ({ data, error } = await (orderFn.call(query, 'created_at', { ascending: false }) as any).limit(limit));
    } else {
      ({ data, error } = await (query as any).limit(limit));
    }
  } catch (e: any) {
    error = e;
  }
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'admin.audit.view', entity_type: 'audit', entity_id: null, details: {} }); } catch {}
  return NextResponse.json(data ?? [], { status: 200, headers: { 'x-request-id': requestId } });
});


