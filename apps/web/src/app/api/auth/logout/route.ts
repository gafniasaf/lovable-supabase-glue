import { NextResponse } from "next/server";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";
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
  const res = jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
  try {
    // Best-effort: clear test-mode role cookie used in automated tests
    res.cookies.set("x-test-auth", "", { path: "/", maxAge: 0 });
  } catch {
    // noop
  }
  return res;
});


