// @ts-nocheck
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";

export default async function SettingsPage() {
	const hh = headers();
	const cookie = hh.get("cookie") ?? cookies().getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const ta = hh.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;
	const baseHeaders = { ...(cookie ? { cookie } : {}), ...(ta ? { "x-test-auth": ta } : {}) } as HeadersInit;
	const { serverFetch } = await import("@/lib/serverFetch");
	const profRes = await serverFetch('/api/user/profile', { cache: 'no-store', headers: baseHeaders });
	const profile = profRes.ok ? await profRes.json() : ({} as any);
	const prefsRes = await serverFetch('/api/notifications/preferences', { cache: 'no-store', headers: baseHeaders });
	const prefs = prefsRes.ok ? await prefsRes.json() : {} as Record<string, boolean>;
	async function saveAction(formData: FormData) {
		"use server";
		const obj: Record<string, boolean> = {};
		for (const [key] of formData.entries()) if (typeof key === 'string') obj[key] = formData.get(key) === 'on';
		const { serverFetch } = await import("@/lib/serverFetch");
		await serverFetch(`/api/notifications/preferences`, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify(obj) });
		revalidatePath('/dashboard/settings');
	}

	async function saveProfile(formData: FormData) {
		"use server";
		const payload = {
			display_name: formData.get('display_name') || '',
			bio: formData.get('bio') || ''
		};
		const { serverFetch } = await import("@/lib/serverFetch");
		await serverFetch(`/api/user/profile`, { method: 'PUT', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify(payload) });
		revalidatePath('/dashboard/settings');
	}
	return (
		<section className="p-6 space-y-4" aria-label="Settings">
			<Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} />
			<h1 className="text-xl font-semibold"><Trans keyPath="settings.title" /></h1>
			<section className="border rounded p-4 max-w-xl">
				<h2 className="font-medium mb-2"><Trans keyPath="settings.profile" fallback="Profile" /></h2>
				<form action={saveProfile} className="space-y-3">
					<FormField label="Name" htmlFor="display_name">
						<Input id="display_name" name="display_name" defaultValue={profile?.display_name || ''} />
					</FormField>
					<FormField label="Bio" htmlFor="bio">
						<TextArea id="bio" name="bio" rows={3} defaultValue={profile?.bio || ''} />
					</FormField>
					<div>
						<button className="underline text-sm"><Trans keyPath="settings.save" /></button>
					</div>
				</form>
			</section>

			<section className="border rounded p-4 max-w-xl">
				<h2 className="font-medium mb-2"><Trans keyPath="settings.notifications" /></h2>
				<form action={saveAction} className="space-y-2">
					{Object.keys(prefs).length === 0 ? (
						<div className="text-gray-500">No preference types available.</div>
					) : (
						<ul className="space-y-2">
							{Object.entries(prefs).map(([k, v]) => (
								<li key={k} className="flex items-center gap-2">
									<input id={`pref-${k}`} type="checkbox" name={k} defaultChecked={!!v} />
									<label htmlFor={`pref-${k}`} className="text-sm">{k}</label>
								</li>
							))}
						</ul>
					)}
					<div>
						<button className="underline text-sm"><Trans keyPath="settings.save" /></button>
					</div>
				</form>
			</section>
		</section>
	);
}


