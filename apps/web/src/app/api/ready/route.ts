import { NextRequest } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const dto = z.object({ ok: z.boolean() });
	return jsonDto({ ok: true } as any, dto as any, { requestId, status: 200 });
});


