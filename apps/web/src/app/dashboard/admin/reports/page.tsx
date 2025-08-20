import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { headers, cookies } from "next/headers";
import { createReportsGateway } from "@/lib/data";

export default async function AdminReportsPage() {
	const hh = headers();
	const cc = cookies();
	const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
	const gw = createReportsGateway();
	const [engagement, grades, dau, activity] = await Promise.all([
		gw.engagement().catch(() => ({ lessons: 0, assignments: 0, submissions: 0 })),
		gw.gradeDistribution().catch(() => ({ total: 0, average: 0, dist: [] as any[] })),
		gw.retention({}).catch(() => ([] as any[])),
		gw.activity({ limit: 5 }).catch(() => ([] as any[]))
	]);
	return (
		<section className="p-6 space-y-4" aria-label="Reports">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Reports" }]} />
			<h1 className="text-xl font-semibold">Reports</h1>
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Lessons</div><div className="text-2xl font-semibold">{(engagement as any).lessons ?? '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Assignments</div><div className="text-2xl font-semibold">{(engagement as any).assignments ?? '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Submissions</div><div className="text-2xl font-semibold">{(engagement as any).submissions ?? '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">DAU (latest)</div><div className="text-2xl font-semibold">{Array.isArray(dau) ? ((dau as any).at(-1)?.dau ?? '—') : '—'}</div></div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="border rounded p-4">
					<div className="text-sm text-gray-600 mb-2">Recent Activity</div>
					<ul className="space-y-1 text-sm">
						{Array.isArray(activity) && (activity as any[]).length > 0 ? (activity as any[]).map((ev: any) => (
							<li key={ev.id} className="flex justify-between"><span>{ev.event_type}</span><span className="text-gray-500">{new Date(ev.ts).toLocaleString()}</span></li>
						)) : <li className="text-gray-500">No activity</li>}
					</ul>
				</div>
				<div className="border rounded p-4">
					<div className="text-sm text-gray-600 mb-2">Grade Distribution</div>
					<ul className="space-y-1 text-sm">
						{Array.isArray((grades as any).dist) && (grades as any).dist.length > 0 ? (grades as any).dist.map((r: any) => (
							<li key={r.bucket} className="flex justify-between"><span>{r.bucket}</span><span>{r.count}</span></li>
						)) : <li className="text-gray-500">No data</li>}
					</ul>
				</div>
			</div>
		</section>
	);
}


