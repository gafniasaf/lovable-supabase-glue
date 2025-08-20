// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { checkpointLoadRequest } from "@education/shared";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { getRequestOrigin, isOriginAllowedByEnv, buildCorsHeaders } from "@/lib/cors";

function isRuntimeV2Enabled() {
  return process.env.RUNTIME_API_V2 === '1';
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isRuntimeV2Enabled()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Runtime v2 disabled' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const auth = req.headers.get('authorization') || '';
  const rt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!rt) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Missing runtime token' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let claims: any = null;
  try {
    const pub = process.env.NEXT_RUNTIME_PUBLIC_KEY || '';
    if (pub) {
      const jose = await import('jose');
      const key = await jose.importSPKI(pub, 'RS256');
      const { payload } = await jose.jwtVerify(rt, key, { algorithms: ['RS256'] });
      claims = payload;
    } else {
      if (process.env.NODE_ENV === 'production') throw new Error('NEXT_RUNTIME_PUBLIC_KEY required');
      const secret = new TextEncoder().encode(process.env.NEXT_RUNTIME_SECRET || 'dev-secret');
      const { payload } = await (await import('jose')).jwtVerify(rt, secret, { algorithms: ['HS256'] });
      claims = payload;
    }
  } catch {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Invalid runtime token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  }
  // Enforce audience binding and scope (read)
  try {
    const reqOrigin = getRequestOrigin(req as any);
    if (reqOrigin && isOriginAllowedByEnv(reqOrigin)) {
      const aud = (claims as any)?.aud as string | undefined;
      if (!aud || aud !== reqOrigin) {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Audience mismatch' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
      }
    }
    const scopes: string[] = Array.isArray((claims as any)?.scopes) ? (claims as any).scopes : [];
    if (!scopes.includes('progress.read') && !scopes.includes('attempts.read')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Missing scope' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    }
  } catch {}
  const url = new URL(req.url);
  const parsed = checkpointLoadRequest.safeParse({ key: url.searchParams.get('key') });
  if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const alias = String((claims as any)?.alias || '');
  const courseId = String((claims as any)?.courseId || '');
  const supabase = getRouteHandlerSupabase();
  let state: any = null;
  try {
    const { data } = await supabase.from('runtime_checkpoints').select('state').eq('course_id', courseId).eq('alias', alias).eq('key', parsed.data.key).single();
    state = (data as any)?.state ?? null;
  } catch {}
  const reqOrigin = getRequestOrigin(req as any);
  const allowCors = !!reqOrigin && isOriginAllowedByEnv(reqOrigin);
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (allowCors) Object.assign(headers, buildCorsHeaders(reqOrigin));
  return NextResponse.json({ key: parsed.data.key, state }, { status: 200, headers });
});

export async function OPTIONS(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const origin = getRequestOrigin(req as any);
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (origin && isOriginAllowedByEnv(origin)) Object.assign(headers, buildCorsHeaders(origin));
  return new Response(null, { status: 204, headers });
}


