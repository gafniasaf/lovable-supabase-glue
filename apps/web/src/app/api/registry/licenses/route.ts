import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute(req);
	const role = (user?.user_metadata as any)?.role ?? undefined;
	if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
	let rows: any[] = [];
	try {
		const supabase = getRouteHandlerSupabase();
		const { data } = await supabase.from('licenses').select('*').limit(1000);
		rows = Array.isArray(data) ? data : [];
	} catch { rows = []; }
	const dto = z.object({ rows: z.array(z.record(z.any())) });
	return jsonDto({ rows } as any, dto as any, { requestId, status: 200 });
});

const patchSchema = z.object({ id: z.string().min(1), action: z.enum(['enforce','disable','update']), data: z.record(z.any()).optional() }).strict();

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute(req);
	const role = (user?.user_metadata as any)?.role ?? undefined;
	if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
	let body: z.infer<typeof patchSchema>;
	try { body = patchSchema.parse(await req.json()); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: String(e?.message || e) }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
	try {
		const supabase = getRouteHandlerSupabase();
		if (body.action === 'disable') {
			await supabase.from('licenses').update({ status: 'disabled' } as any).eq('id', body.id);
		} else if (body.action === 'enforce') {
			await supabase.from('licenses').update({ status: 'active' } as any).eq('id', body.id);
		} else if (body.action === 'update' && body.data) {
			await supabase.from('licenses').update(body.data as any).eq('id', body.id);
		}
	} catch {}
	const dto = z.object({ ok: z.boolean() });
	return jsonDto({ ok: true } as any, dto as any, { requestId, status: 200 });
});


