import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { jsonDto } from "@/lib/jsonDto";
import { isTestMode } from "@/lib/testMode";
import { z } from "zod";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute(req);
	const role = (user?.user_metadata as any)?.role ?? undefined;
	if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
	let rows: any[] = [];
	try {
		if (isTestMode()) {
			const day = new Date().toISOString().slice(0,10);
			rows = [
				{ day, metric: 'runtime.progress', count: 5 },
				{ day, metric: 'runtime.grade', count: 2 }
			];
		} else {
			const supabase = getRouteHandlerSupabase();
			const { data } = await supabase.from('usage_counters').select('*').limit(1000);
			rows = Array.isArray(data) ? data : [];
		}
	} catch { rows = []; }
	const dto = z.object({ rows: z.array(z.record(z.any())) });
	return jsonDto({ rows } as any, dto as any, { requestId, status: 200 });
});


