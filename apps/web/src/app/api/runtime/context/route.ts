import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { contextResponse } from "@education/shared";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { getRequestOrigin, isOriginAllowedByEnv, buildCorsHeaders } from "@/lib/cors";
import { isRuntimeV2Enabled } from "@/lib/runtime";
import { verifyRuntimeAuthorization } from "@/lib/runtimeAuth";
import { jsonDto } from "@/lib/jsonDto";

// gated via shared helper

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isRuntimeV2Enabled()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Runtime v2 disabled' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  // Validate runtime token centrally
  const vr = verifyRuntimeAuthorization(req, []);
  if ((vr as any)?.then) {
    const out = await (vr as any);
    if (!out.ok) return NextResponse.json({ error: { code: out.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', message: out.message }, requestId }, { status: out.status, headers: { 'x-request-id': requestId } });
    (global as any).__RT_CLAIMS__ = out.claims; // temp pass-through for this route
  } else if (!(vr as any).ok) {
    const out = vr as any;
    return NextResponse.json({ error: { code: out.status === 401 ? 'UNAUTHENTICATED' : 'FORBIDDEN', message: out.message }, requestId }, { status: out.status, headers: { 'x-request-id': requestId } });
  } else {
    (global as any).__RT_CLAIMS__ = (vr as any).claims;
  }
  const claims = (global as any).__RT_CLAIMS__;
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
  const res = jsonDto(out as any, contextResponse as any, { requestId, status: 200 });
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, String(v));
  return res;
});

export async function OPTIONS(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const origin = getRequestOrigin(req as any);
  const headers: Record<string, string> = { 'x-request-id': requestId, 'vary': 'Origin' };
  if (origin && isOriginAllowedByEnv(origin)) Object.assign(headers, buildCorsHeaders(origin));
  return new Response(null, { status: 204, headers });
}


