// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { contextResponse } from "@education/shared";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { getRequestOrigin, isOriginAllowedByEnv, buildCorsHeaders } from "@/lib/cors";

function isRuntimeV2Enabled() {
  return process.env.RUNTIME_API_V2 === '1';
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isRuntimeV2Enabled()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Runtime v2 disabled' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  // Validate runtime token from Authorization header
  const auth = req.headers.get('authorization') || '';
  const rt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!rt) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Missing runtime token' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let claims: any = null;
  try {
    const pub = process.env.NEXT_RUNTIME_PUBLIC_KEY || '';
    if (pub) {
      const key = await (await import('jose')).importSPKI(pub, 'RS256');
      const { payload } = await (await import('jose')).jwtVerify(rt, key, { algorithms: ['RS256'] });
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
  // Load role via course enrollment/ownership (simplified student for now)
  const supabase = getRouteHandlerSupabase();
  // Enforce audience binding when origin provided
  try {
    const reqOrigin = getRequestOrigin(req as any);
    if (reqOrigin && isOriginAllowedByEnv(reqOrigin)) {
      const aud = (claims as any)?.aud as string | undefined;
      if (!aud || aud !== reqOrigin) {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Audience mismatch' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
      }
    }
  } catch {}
  let role: 'student' | 'teacher' | 'parent' | 'admin' = 'student';
  try {
    const { data: course } = await supabase.from('courses').select('teacher_id').eq('id', (claims as any).courseId).single();
    if (course && (course as any).teacher_id) role = 'teacher';
  } catch {}
  const out = contextResponse.parse({ alias: String((claims as any)?.alias || ''), role, courseId: String((claims as any)?.courseId || ''), assignmentId: null, scopes: Array.isArray((claims as any)?.scopes) ? (claims as any).scopes : [] });
  const reqOrigin = getRequestOrigin(req as any);
  const allowCors = !!reqOrigin && isOriginAllowedByEnv(reqOrigin);
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (allowCors) Object.assign(headers, buildCorsHeaders(reqOrigin));
  return NextResponse.json(out, { status: 200, headers });
});

export async function OPTIONS(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const origin = getRequestOrigin(req as any);
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (origin && isOriginAllowedByEnv(origin)) Object.assign(headers, buildCorsHeaders(origin));
  return new Response(null, { status: 204, headers });
}


