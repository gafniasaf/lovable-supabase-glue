// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { headers, cookies } from "next/headers";

export default async function AdminReportsPage() {
	const hh = headers();
	const cc = cookies();
	const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
	const baseHeaders = { ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) } as HeadersInit;
	const { serverFetch } = await import("@/lib/serverFetch");
	const engagement = await serverFetch(`/api/reports/engagement`, { cache: 'no-store', headers: baseHeaders }).then(r => r.json()).catch(() => ({ activePerWeek: [] as any[], courses: [] as any[] }));
	const grades = await serverFetch(`/api/reports/grade-distribution`, { cache: 'no-store', headers: baseHeaders }).then(r => r.json()).catch(() => ({ avgScoreTrend: [] as any[] }));
	return (
		<section className="p-6 space-y-4" aria-label="Reports">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Reports" }]} />
			<h1 className="text-xl font-semibold">Reports</h1>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Courses</div><div className="text-2xl font-semibold">{Array.isArray(engagement?.courses) ? engagement.courses.length : '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Latest avg score</div><div className="text-2xl font-semibold">{Array.isArray(grades?.avgScoreTrend) ? `${grades.avgScoreTrend.at(-1) ?? '—'}%` : '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Active users/week</div><div className="text-2xl font-semibold">{Array.isArray(engagement?.activePerWeek) ? (engagement.activePerWeek.at(-1)?.count ?? '—') : '—'}</div></div>
			</div>
		</section>
	);
}


