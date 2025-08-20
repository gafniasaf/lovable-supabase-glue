import { NextRequest, NextResponse } from "next/server";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const base = supabase.from('user_storage_quotas').select('user_id,max_bytes,used_bytes,updated_at') as any;
  let data: any[] | null = null; let error: any = null;
  try {
    const orderFn = (base as any).order;
    if (typeof orderFn === 'function') {
      ({ data, error } = await (orderFn.call(base, 'updated_at', { ascending: false }) as any).limit(500));
    } else {
      ({ data, error } = await (base as any).limit(500));
    }
  } catch (e: any) { error = e; }
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const dto = z.array(z.object({ user_id: z.string().min(1), used_bytes: z.number().int().nonnegative().optional() })).optional();
  return jsonDto((data ?? []) as any, dto as any, { requestId, status: 200 });
});

const patchSchema = z.object({ user_id: z.string().uuid(), max_bytes: z.number().int().nonnegative().optional(), used_bytes: z.number().int().nonnegative().optional(), action: z.enum(['reset_used']).optional() }).strict();

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  try {
    const rl = checkRateLimit(`admin:quota:${user.id}`, 60, 60000);
    if (!rl.allowed) {
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId }, { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)) } });
    }
  } catch {}
  let body: z.infer<typeof patchSchema>;
  try { body = patchSchema.parse(await req.json()); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: String(e?.message || e) }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const supabase = getRouteHandlerSupabase();
  let row: any = { user_id: body.user_id, updated_at: new Date().toISOString() };
  if (body.action === 'reset_used') {
    row.used_bytes = 0;
  }
  if (typeof body.max_bytes === 'number') row.max_bytes = body.max_bytes;
  if (typeof body.used_bytes === 'number') row.used_bytes = body.used_bytes;
  const { error } = await supabase.from('user_storage_quotas').upsert(row, { onConflict: 'user_id' } as any);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
});


