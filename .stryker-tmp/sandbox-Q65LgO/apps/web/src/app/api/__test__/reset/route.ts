/**
 * Test reset API (legacy path)
 *
 * POST /api/__test__/reset — clears the in-memory test store (enabled in dev/test)
 */
// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { resetTestStore } from "@/lib/testStore";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  // Namespaced reset (future-proof: currently resets global store)
  try { void req.nextUrl.searchParams.get('namespace'); } catch {}
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  resetTestStore();
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
});


