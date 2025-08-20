// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { headers, cookies } from "next/headers";

export default async function CourseAnalyticsPage({ params }: { params: { courseId: string } }) {
	const hh = headers();
	const cc = cookies();
	const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
	const baseHeaders = { ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) } as HeadersInit;
	const { serverFetch } = await import("@/lib/serverFetch");
	const engagement = await serverFetch(`/api/reports/engagement?course_id=${encodeURIComponent(params.courseId)}`, { cache: 'no-store', headers: baseHeaders }).then(r => r.json()).catch(() => ({ activePerWeek: [] as any[] }));
	const grades = await serverFetch(`/api/reports/grade-distribution?course_id=${encodeURIComponent(params.courseId)}`, { cache: 'no-store', headers: baseHeaders }).then(r => r.json()).catch(() => ({ buckets: [] as any[], completionPct: '—', avgScoreTrend: [] as any[] }));
	return (
		<section className="p-6 space-y-4" aria-label="Course analytics">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Analytics" }]} />
			<h1 className="text-xl font-semibold">Course analytics</h1>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Completion %</div><div className="text-2xl font-semibold">{grades?.completionPct ?? '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Avg score trend</div><div className="text-2xl font-semibold">{Array.isArray(grades?.avgScoreTrend) ? `${grades.avgScoreTrend.at(-1) ?? '—'}%` : '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Active students/week</div><div className="text-2xl font-semibold">{Array.isArray(engagement?.activePerWeek) ? (engagement.activePerWeek.at(-1)?.count ?? '—') : '—'}</div></div>
			</div>
			<div className="text-sm">
				<a className="underline" href={`/api/reports/grade-distribution?course_id=${encodeURIComponent(params.courseId)}&format=csv`}>Download grade distribution CSV</a>
			</div>
			{Array.isArray((grades as any)?.buckets) && (grades as any).buckets.length > 0 ? (
				<section>
					<h2 className="font-medium mt-4">Grade distribution</h2>
					<table className="w-full text-sm border mt-2">
						<thead><tr className="bg-gray-50 text-left"><th className="p-2 border">Bucket</th><th className="p-2 border">Count</th></tr></thead>
						<tbody>
							{(grades as any).buckets.slice(0, 100).map((b: any, i: number) => (
								<tr key={i} className="border-b"><td className="p-2 border">{b.bucket}</td><td className="p-2 border">{b.count}</td></tr>
							))}
						</tbody>
					</table>
				</section>
			) : null}
			<p className="text-gray-600">Light analytics wired to API.</p>
		</section>
	);
}


