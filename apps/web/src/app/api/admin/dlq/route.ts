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
			rows = [
				{ id: 'dlq-1', kind: 'runtime.event', error: 'timeout', attempts: 1, created_at: new Date().toISOString() },
				{ id: 'dlq-2', kind: 'provider.health', error: 'HTTP 500', attempts: 2, created_at: new Date().toISOString() }
			];
		} else {
			const supabase = getRouteHandlerSupabase();
			const { data } = await supabase.from('dead_letters').select('*').order('created_at', { ascending: false }).limit(100);
			rows = Array.isArray(data) ? data : [];
		}
	} catch {
		rows = [];
	}
	const dto = z.object({ rows: z.array(z.record(z.any())) });
	return jsonDto({ rows } as any, dto as any, { requestId, status: 200 });
});

const dlqPatchSchema = z.object({ id: z.string().min(1), action: z.enum(['replay', 'delete']) }).strict();

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute(req);
	const role = (user?.user_metadata as any)?.role ?? undefined;
	if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
	let body: z.infer<typeof dlqPatchSchema>;
	try { body = dlqPatchSchema.parse(await req.json()); } catch (e: any) {
		return NextResponse.json({ error: { code: 'BAD_REQUEST', message: String(e?.message || e) }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
	}
	try {
		const supabase = getRouteHandlerSupabase();
		if (body.action === 'delete') {
			await supabase.from('dead_letters').delete().eq('id', body.id);
		} else if (body.action === 'replay') {
			// Minimal stub: mark for replay by updating next_attempt_at
			await supabase.from('dead_letters').update({ next_attempt_at: new Date().toISOString() } as any).eq('id', body.id);
		}
	} catch {}
	const dto = z.object({ ok: z.boolean() });
	return jsonDto({ ok: true } as any, dto as any, { requestId, status: 200 });
});


