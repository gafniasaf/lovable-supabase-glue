/**
 * Test reset API (legacy path)
 *
 * POST /api/__test__/reset — clears the in-memory test store (enabled in dev/test)
 */
import { NextRequest, NextResponse } from "next/server";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";
import { resetTestStore } from "@/lib/testStore";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  // Namespaced reset (future-proof: currently resets global store)
  try { void req.nextUrl.searchParams.get('namespace'); } catch {}
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  resetTestStore();
  return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
});


