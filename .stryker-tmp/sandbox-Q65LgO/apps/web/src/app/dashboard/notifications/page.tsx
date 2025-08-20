// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Notification = { id: string; user_id: string; type: string; payload: any; created_at: string; read_at?: string | null };

export default async function NotificationsInboxPage() {
	const hh = headers();
	const c = cookies();
	const cookieHeader = hh.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const testAuth = hh.get("x-test-auth") ?? c.get("x-test-auth")?.value;
	const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;
	const { serverFetch } = await import("@/lib/serverFetch");
	const prefsRes = await serverFetch('/api/notifications/preferences', { cache: 'no-store', headers: baseHeaders });
	const prefs = prefsRes.ok ? await prefsRes.json() : {} as Record<string, boolean>;
	const res = await serverFetch('/api/notifications', { cache: 'no-store', headers: baseHeaders });
	const list: Notification[] = res.ok ? await res.json() : [];

	async function markAllRead() {
		"use server";
		const hh = headers(); const cc = cookies();
		const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
		const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
		const { serverFetch } = await import("@/lib/serverFetch");
		await serverFetch('/api/notifications/read-all', { method: 'PATCH', headers: { ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) } });
		revalidatePath('/dashboard/notifications');
		redirect('/dashboard/notifications#read');
	}

	return (
		<section className="p-6 space-y-4" aria-label="Notifications">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]} />
			<form action={markAllRead}><button className="bg-black text-white rounded px-3 py-1"><Trans keyPath="notifications.markAllRead" /></button></form>
			{list.length === 0 ? (
				<div className="text-gray-600"><Trans keyPath="notifications.empty" fallback="No notifications" /></div>
			) : (
				<ul className="space-y-2" data-testid="notifications-list">
					{list.map(n => (
						<li key={n.id} className="border rounded p-3">
							<div className="text-sm text-gray-600">{new Date(n.created_at).toLocaleString()}</div>
							<div className="font-medium">{n.type}</div>
							<pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(n.payload || {}, null, 2)}</pre>
							<div className="text-xs">read: {n.read_at ? 'yes' : 'no'}</div>
							{!n.read_at && (
								<form action={async () => {
									"use server";
									const hh = headers(); const cc = cookies();
									const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
									const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
									const { serverFetch } = await import("@/lib/serverFetch");
									await serverFetch(`/api/notifications?id=${n.id}`, { method: 'PATCH', headers: { ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) } });
									revalidatePath('/dashboard/notifications');
									redirect('/dashboard/notifications#read');
								}}>
									<button className="mt-2 border rounded px-2 py-1 text-xs" data-testid={`mark-read-${n.id}`}>Mark read</button>
								</form>
							)}
						</li>
					))}
				</ul>
			)}

			<section className="border rounded p-3">
				<h2 className="font-medium mb-2"><Trans keyPath="settings.notifications" /></h2>
				<form action={async (formData: FormData) => {
					"use server";
					const hh = headers();
					const cc = cookies();
					const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
					const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
					const obj: Record<string, boolean> = {};
					for (const key of ['assignment:new','submission:graded','message:new','announcement:published','quiz:due-soon']) {
						obj[key] = formData.get(key) === 'on';
					}
					const { serverFetch } = await import("@/lib/serverFetch");
					await serverFetch(`/api/notifications/preferences`, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify(obj) });
					revalidatePath('/dashboard/notifications');
				}} className="space-y-2">
					{['assignment:new','submission:graded','message:new','announcement:published','quiz:due-soon'].map(k => (
						<label key={k} className="flex items-center gap-2">
							<input type="checkbox" name={k} defaultChecked={!!prefs[k]} />
							<span className="font-mono text-sm">{k}</span>
						</label>
					))}
					<button className="bg-black text-white rounded px-3 py-1" type="submit"><Trans keyPath="settings.save" /></button>
				</form>
			</section>
		</section>
	);
}


