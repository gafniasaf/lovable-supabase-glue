/**
 * User role API
 *
 * PATCH /api/user/role — update a user's role (admin only)
 */
// @ts-nocheck

import { NextResponse } from "next/server";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { updateRoleRequest } from "@education/shared";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { updateUserRole } from "@/server/services/users";

export const PATCH = withRouteTiming(createApiHandler({
	schema: updateRoleRequest,
	handler: async (input) => {
		const caller = await getCurrentUserInRoute();
		const requestId = crypto.randomUUID();
		if (!caller) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
		const callerRole = (caller.user_metadata as any)?.role;
		if (callerRole !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
		const out = await updateUserRole({ userId: input!.userId, role: input!.role });
		try {
			const { getRouteHandlerSupabase } = await import('@/lib/supabaseServer');
			const supabase = getRouteHandlerSupabase();
			await supabase.from('audit_logs').insert({ actor_id: caller.id, action: 'user.role_update', entity_type: 'user', entity_id: input!.userId, details: { role: input!.role } });
		} catch {}
		return NextResponse.json(out, { status: 200 });
	}
}));


