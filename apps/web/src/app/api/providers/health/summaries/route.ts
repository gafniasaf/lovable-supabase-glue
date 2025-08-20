import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { jsonDto } from "@/lib/jsonDto";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  try {
    const supabase = getRouteHandlerSupabase();
    const { data } = await supabase.from('provider_health').select('provider_id,jwks_ok,domain_ok,checked_at');
    const map: Record<string, { jwks_ok: boolean; domain_ok: boolean; checked_at: string } > = {};
    for (const row of (data ?? []) as any[]) {
      map[String(row.provider_id)] = { jwks_ok: !!row.jwks_ok, domain_ok: !!row.domain_ok, checked_at: String(row.checked_at) };
    }
    const dto = z.record(z.object({ jwks_ok: z.boolean(), domain_ok: z.boolean(), checked_at: z.string() }));
    return jsonDto(map as any, dto as any, { requestId, status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: String(e?.message || e) }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const dynamic = 'force-dynamic';


