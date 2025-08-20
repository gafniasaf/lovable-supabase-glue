import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createAnnouncementsGateway } from "@/lib/data/announcements";

export default async function ParentAnnouncementsPage() {
	const rows = await createAnnouncementsGateway().listAll().catch(() => [] as any[]);
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


