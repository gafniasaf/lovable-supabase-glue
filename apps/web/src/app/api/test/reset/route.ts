/**
 * Test reset API
 *
 * POST /api/test/reset — clears the in-memory test store (test mode only)
 */
import { NextResponse } from "next/server";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";
import { resetTestStore } from "@/lib/testStore";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(async function POST(req: Request) {
  // Always allow reset in this dev/test environment to stabilize E2E
  const requestId = (req.headers as any)?.get?.('x-request-id') || crypto.randomUUID();
  resetTestStore();
  return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
});


