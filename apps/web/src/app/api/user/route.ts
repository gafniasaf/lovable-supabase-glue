import { NextResponse } from "next/server";
import { isTestMode } from "@/lib/testMode";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (ids.length === 0) return jsonDto([] as any, z.array(z.object({ id: z.string().min(1), display_name: z.string().nullable().optional(), email: z.string().email().nullable().optional() })), { requestId, status: 200 });

  if (isTestMode()) {
    const { getTestProfile } = await import("@/lib/testStore");
    const rows = ids.map(id => {
      const p = getTestProfile(id) as any;
      return { id, display_name: p?.display_name ?? null, email: p?.email ?? null };
    });
    const dto = z.array(z.object({ id: z.string().min(1), display_name: z.string().nullable().optional(), email: z.string().email().nullable().optional() }));
    return jsonDto(rows as any, dto as any, { requestId, status: 200 });
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from('profiles').select('id,display_name,email').in('id', ids);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const dto = z.array(z.object({ id: z.string().min(1), display_name: z.string().nullable().optional(), email: z.string().email().nullable().optional() }));
  return jsonDto((data ?? []) as any, dto as any, { requestId, status: 200 });
}


