import { NextRequest, NextResponse } from "next/server";

/** Readiness endpoint: lightweight checks only (no external fetch). */
export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  // Consider ready if basic envs are present and process is responsive
  const hasBase = !!process.env.NEXT_PUBLIC_BASE_URL;
  const hasSupaUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Do not block on DB/storage; health endpoint performs deeper checks
  const ok = hasBase || hasSupaUrl || process.env.TEST_MODE === '1';
  return NextResponse.json({ ok, ts: Date.now() }, { status: ok ? 200 : 503, headers: { 'x-request-id': requestId } });
}


