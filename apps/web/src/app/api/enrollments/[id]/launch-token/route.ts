import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { launchTokenClaims, launchTokenResponse } from "@education/shared";

async function signJwt(payload: any): Promise<string> {
  const jose = await import('jose');
  const pem = process.env.NEXT_RUNTIME_PRIVATE_KEY || "";
  const kid = process.env.NEXT_RUNTIME_KEY_ID || undefined;
  if (pem) {
    try {
      const key = await jose.importPKCS8(pem, 'RS256');
      // Ensure numeric exp/iat are present in payload already
      return await new jose.SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT', ...(kid ? { kid } : {}) })
        .sign(key);
    } catch {
      // fall through to HS256
    }
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('RS256 private key required in production');
  }
  const secret = new TextEncoder().encode(process.env.NEXT_RUNTIME_SECRET || 'dev-secret');
  return await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secret);
}

export const POST = withRouteTiming(async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data: enr, error } = await supabase.from('enrollments').select('id,course_id,student_id').eq('id', params.id).single();
  if (error || !enr) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Enrollment not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
  // Role-based check: student can launch own, teacher can launch owned course
  let allowed = false;
  const role = (user.user_metadata as any)?.role ?? 'student';
  if (role === 'student' && enr.student_id === user.id) allowed = true;
  if (role === 'teacher') {
    const { data: course } = await supabase.from('courses').select('id,teacher_id,launch_kind,launch_url,scopes').eq('id', enr.course_id).single();
    if (course && (course as any).teacher_id === user.id) allowed = true;
  }
  if (!allowed) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not allowed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });

  const exp = Math.floor(Date.now() / 1000) + 10 * 60;
  const nonce = crypto.randomUUID();
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/runtime/outcomes`;
  const claims = { sub: user.id, courseId: enr.course_id, role, exp, iat: Math.floor(Date.now() / 1000), nonce, scopes: (enr as any).scopes ?? [], callbackUrl };
  const payload = launchTokenClaims.parse(claims);
  const token = await signJwt(payload);
  try {
    // Record nonce for one-time-use validation (used_at null initially)
    await supabase.from('interactive_launch_tokens').insert({ nonce, course_id: enr.course_id, user_id: user.id, exp: new Date(exp * 1000).toISOString() });
  } catch {}
  return NextResponse.json(launchTokenResponse.parse({ token, expiresAt: new Date(exp * 1000).toISOString() }), { status: 200, headers: { 'x-request-id': requestId } });
});


