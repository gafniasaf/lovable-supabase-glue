// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { headers, cookies } from "next/headers";

export default async function ParentAnnouncementsPage() {
	const h = headers();
	const cookieHeader = h.get("cookie") ?? cookies().getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;
	const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;
	const { serverFetch } = await import("@/lib/serverFetch");
	const res = await serverFetch('/api/announcements', { cache: 'no-store', headers: baseHeaders });
	const rows = res.ok ? await res.json() : [];
	return (
		<section className="p-6 space-y-4" aria-label="Announcements">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/parent" }, { label: "Announcements" }]} />
			<h1 className="text-xl font-semibold">Announcements</h1>
			{(!rows || rows.length === 0) ? (
				<div className="text-gray-600">No announcements yet.</div>
			) : (
				<ul className="space-y-2">
					{rows.map((a: any) => (
						<li key={a.id} className="border rounded p-3">
							<div className="font-medium">{a.title}</div>
							<div className="text-sm text-gray-600">{new Date(a.created_at).toLocaleString()}</div>
							<p className="mt-1">{a.body}</p>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}


