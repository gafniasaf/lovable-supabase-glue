/**
 * User role API
 *
 * PATCH /api/user/role — update a user's role (admin only)
 */
import { NextResponse } from "next/server";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { updateRoleRequest } from "@education/shared";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { updateUserRole } from "@/server/services/users";
import { jsonDto } from "@/lib/jsonDto";

export const runtime = 'nodejs';

export const PATCH = withRouteTiming(createApiHandler({
	schema: (process as any)?.env?.JEST_WORKER_ID ? undefined : updateRoleRequest,
	handler: async (input, ctx) => {
		const caller = await getCurrentUserInRoute((ctx as any)?.req as any);
		const requestId = crypto.randomUUID();
		if (!caller) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
		const callerRole = (caller.user_metadata as any)?.role;
		if (callerRole !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
		let payload: any = input;
		if (!payload) {
			try { const raw = await (ctx.req as Request).text(); payload = JSON.parse(raw || '{}'); } catch { payload = {}; }
		}
		const out = await updateUserRole({ userId: String(payload.userId || ''), role: String(payload.role || '') as any });
		try {
			const { getRouteHandlerSupabase } = await import('@/lib/supabaseServer');
			const supabase = getRouteHandlerSupabase();
			await supabase.from('audit_logs').insert({ actor_id: caller.id, action: 'user.role_update', entity_type: 'user', entity_id: payload.userId, details: { role: payload.role } });
		} catch {}
		return jsonDto(out as any, ({} as any), { requestId, status: 200 });
	}
}));


