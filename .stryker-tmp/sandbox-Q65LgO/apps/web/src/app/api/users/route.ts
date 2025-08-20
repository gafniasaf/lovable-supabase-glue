// @ts-nocheck
import { NextResponse } from "next/server";
import { isTestMode } from "@/lib/testMode";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { withRouteTiming } from "@/server/withRouteTiming";

export const GET = withRouteTiming(async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (ids.length === 0) return NextResponse.json([], { status: 200, headers: { 'x-request-id': requestId } });

  if (isTestMode()) {
    const { getTestProfile } = await import("@/lib/testStore");
    const rows = ids.map(id => {
      const p = getTestProfile(id) as any;
      return { id, display_name: p?.display_name ?? null, email: p?.email ?? null };
    });
    return NextResponse.json(rows, { status: 200, headers: { 'x-request-id': requestId } });
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from('profiles').select('id,display_name,email').in('id', ids);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  return NextResponse.json(data ?? [], { status: 200, headers: { 'x-request-id': requestId } });
});


