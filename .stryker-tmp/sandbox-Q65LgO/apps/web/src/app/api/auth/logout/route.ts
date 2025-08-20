// @ts-nocheck
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { withRouteTiming } from "@/server/withRouteTiming";

/**
 * POST /api/auth/logout — end the current Supabase session.
 * Clears test-mode role cookie if present.
 */
export const POST = withRouteTiming(async function POST(req: Request) {
  const requestId = (req.headers as any)?.get?.('x-request-id') || crypto.randomUUID();
  try {
    const supabase = getRouteHandlerSupabase();
    await supabase.auth.signOut();
  } catch {
    // ignore errors and still return ok
  }
  const res = NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
  try {
    // Best-effort: clear test-mode role cookie used in automated tests
    res.cookies.set("x-test-auth", "", { path: "/", maxAge: 0 });
  } catch {
    // noop
  }
  return res;
});


