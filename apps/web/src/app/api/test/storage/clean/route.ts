import { NextRequest, NextResponse } from "next/server";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";
import { isTestMode } from "@/lib/testMode";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isTestMode()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Test mode only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const namespace = req.nextUrl.searchParams.get('namespace') || process.env.DEV_ID || '';
  if (!namespace) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'namespace required (or DEV_ID)' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const bucket = process.env.NEXT_PUBLIC_UPLOAD_BUCKET || 'public';
  const supabase = getRouteHandlerSupabase();
  try {
    // List objects under namespace prefix and remove
    const { data } = await (supabase as any).storage.from(bucket).list(namespace, { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } });
    const files: string[] = Array.isArray(data) ? data.map((d: any) => `${namespace}/${d.name}`) : [];
    if (files.length > 0) await (supabase as any).storage.from(bucket).remove(files);
  } catch {}
  const dto = z.object({ ok: z.boolean(), namespace: z.string().min(1), bucket: z.string().min(1) });
  return jsonDto({ ok: true, namespace, bucket } as any, dto as any, { requestId, status: 200 });
});

export const dynamic = 'force-dynamic';


