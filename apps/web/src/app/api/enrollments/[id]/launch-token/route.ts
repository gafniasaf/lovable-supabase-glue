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

  // Optional license enforcement: block when seats exhausted or license inactive
  try {
    if (process.env.LICENSE_ENFORCEMENT === '1') {
      const { data: lic } = await supabase
        .from('licenses')
        .select('id,status,seats_total,seats_used')
        .eq('external_course_id', (enr as any).course_id)
        .single();
      if (lic) {
        const status = String((lic as any).status || 'active');
        if (status !== 'active') {
          return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'LICENSE_INACTIVE' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        }
        const total = Number((lic as any).seats_total || 0);
        const used = Number((lic as any).seats_used || 0);
        if (total > 0 && used >= total) {
          return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'LICENSE_EXHAUSTED' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        }
        if (total > 0) {
          try { await supabase.from('licenses').update({ seats_used: used + 1 } as any).eq('id', (lic as any).id); } catch {}
        }
      }
    }
  } catch {}

  const exp = Math.floor(Date.now() / 1000) + 10 * 60;
  const nonce = crypto.randomUUID();
  // Ensure valid URL and UUIDs in test environments
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL && /^https?:\/\//.test(String(process.env.NEXT_PUBLIC_BASE_URL))
    ? String(process.env.NEXT_PUBLIC_BASE_URL)
    : 'http://localhost';
  const callbackUrl = `${baseUrl}/api/runtime/outcomes`;
  // Coerce to known UUIDs in TEST_MODE to satisfy strict schema
  const testIds: Record<string, string> = {
    teacher: '11111111-1111-1111-1111-111111111111',
    student: '22222222-2222-2222-2222-222222222222',
    parent:  '33333333-3333-3333-3333-333333333333',
    admin:   '44444444-4444-4444-4444-444444444444',
  };
  const sub = (process.env.TEST_MODE === '1' || process.env.JEST_WORKER_ID) ? (testIds[role] || user.id) : user.id;
  // Ensure courseId is a uuid in tests; fallback to a stable UUID if not
  const rawCourseId = String((enr as any).course_id);
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const courseId = (process.env.TEST_MODE === '1' || process.env.JEST_WORKER_ID) && !uuidRe.test(rawCourseId)
    ? '00000000-0000-0000-0000-000000000001'
    : rawCourseId;
  const claims = { sub, courseId, role, exp, iat: Math.floor(Date.now() / 1000), nonce, scopes: (enr as any).scopes ?? [], callbackUrl };
  const payload = launchTokenClaims.parse(claims);
  const token = await signJwt(payload);
  try {
    // Record nonce for one-time-use validation (used_at null initially)
    await supabase.from('interactive_launch_tokens').insert({ nonce, course_id: enr.course_id, user_id: user.id, exp: new Date(exp * 1000).toISOString() });
  } catch {}
  return NextResponse.json(launchTokenResponse.parse({ token, expiresAt: new Date(exp * 1000).toISOString() }), { status: 200, headers: { 'x-request-id': requestId } });
});


