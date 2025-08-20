import { NextRequest, NextResponse } from "next/server";
import { isTestMode } from "@/lib/testMode";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isTestMode()) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Test mode only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  }
  const contentType = req.headers.get('content-type') || '';
  let role: string | null = null;
  try {
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      role = String((body as any).role || '').trim();
    } else {
      const form = await req.formData().catch(() => null);
      role = (form?.get('role') as string | null) || null;
    }
  } catch {}
  const valid = new Set(['teacher', 'student', 'parent', 'admin', '']);
  if (!valid.has((role || '').toLowerCase())) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid role' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const referer = req.headers.get('referer') || '/dashboard';
  const res = NextResponse.redirect(new URL(referer, req.url), 303);
  res.headers.set('x-request-id', requestId);
  const normalized = (role || '').toLowerCase();
  if (normalized) {
    res.cookies.set('x-test-auth', normalized, { path: '/', httpOnly: false });
  } else {
    res.cookies.set('x-test-auth', '', { path: '/', httpOnly: false, maxAge: 0 });
  }
  return res;
});

export const dynamic = 'force-dynamic';


