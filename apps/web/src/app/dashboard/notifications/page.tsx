import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import InlineErrorDetails from "@/components/ui/InlineErrorDetails";
import { createNotificationsGateway } from "@/lib/data";

type Notification = { id: string; user_id: string; type: string; payload: any; created_at: string; read_at?: string | null };

export default async function NotificationsInboxPage() {
	// Load via Gateway to keep data access consistent
	const prefs = await createNotificationsGateway().getPreferences().catch(() => ({} as Record<string, boolean>));
	let list: Notification[] = [];
	let loadOk = true;
	try {
		list = await createNotificationsGateway().list(0, 100);
	} catch {
		loadOk = false;
	}
	const requestId: string | null = null;

	async function markAllRead() {
		"use server";
		const { createNotificationsGateway } = await import("@/lib/data");
		await createNotificationsGateway().markAllRead();
		revalidatePath('/dashboard/notifications');
		redirect('/dashboard/notifications#read');
	}

	return (
		<section className="p-6 space-y-4" aria-label="Notifications">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]} />
			<div className="text-sm text-gray-600 flex items-center gap-2" aria-live="polite">
				<span className="inline-flex items-center gap-1">
					<span className="w-2 h-2 rounded-full bg-gray-400" title="Polling" />
					<span>Polling</span>
				</span>
			</div>
			<form action={markAllRead}><button className="bg-black text-white rounded px-3 py-1"><Trans keyPath="notifications.markAllRead" /></button></form>
			{!loadOk ? (
				<InlineErrorDetails message="We couldn’t load your notifications." details={null} requestId={requestId} />
			) : list.length === 0 ? (
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
									const { createNotificationsGateway } = await import("@/lib/data/notifications");
									await createNotificationsGateway().markRead(n.id);
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
					const obj: Record<string, boolean> = {};
					for (const key of ['assignment:new','submission:graded','message:new','announcement:published','quiz:due-soon']) {
						obj[key] = formData.get(key) === 'on';
					}
					const { createNotificationsGateway } = await import("@/lib/data/notifications");
					await createNotificationsGateway().updatePreferences(obj);
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


