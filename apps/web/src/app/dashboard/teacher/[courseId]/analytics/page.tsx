import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createReportsGateway } from "@/lib/data/reports";

export default async function CourseAnalyticsPage({ params }: { params: { courseId: string } }) {
	const gw = createReportsGateway();
	const engagement = await gw.engagement(params.courseId).catch(() => ({ lessons: 0, assignments: 0, submissions: 0 } as any));
	const grades = await gw.gradeDistribution(params.courseId).catch(() => ({ total: 0, average: 0, dist: [] } as any));
	return (
		<section className="p-6 space-y-4" aria-label="Course analytics">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Analytics" }]} />
			<h1 className="text-xl font-semibold">Course analytics</h1>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Average score</div><div className="text-2xl font-semibold">{typeof (grades as any)?.average === 'number' ? `${(grades as any).average}%` : '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Total graded</div><div className="text-2xl font-semibold">{typeof (grades as any)?.total === 'number' ? (grades as any).total : '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">Submissions</div><div className="text-2xl font-semibold">{typeof (engagement as any)?.submissions === 'number' ? (engagement as any).submissions : '—'}</div></div>
			</div>
			<div className="text-sm">
				<a className="underline" href={`/api/reports/grade-distribution?course_id=${encodeURIComponent(params.courseId)}&format=csv`}>Download grade distribution CSV</a>
			</div>
			{Array.isArray((grades as any)?.dist) && (grades as any).dist.length > 0 ? (
				<section>
					<h2 className="font-medium mt-4">Grade distribution</h2>
					<table className="w-full text-sm border mt-2 dark:border-gray-700">
						<thead><tr className="bg-gray-50 text-left"><th className="p-2 border">Bucket</th><th className="p-2 border">Count</th></tr></thead>
						<tbody>
							{(grades as any).dist.slice(0, 100).map((b: any, i: number) => (
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


