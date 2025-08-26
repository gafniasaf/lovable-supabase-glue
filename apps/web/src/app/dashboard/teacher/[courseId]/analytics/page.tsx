import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createReportsGateway } from "@/lib/data/reports";
import TeacherAnalytics from "@/ui/v0/TeacherAnalytics";

export default async function CourseAnalyticsPage({ params }: { params: { courseId: string } }) {
	const gw = createReportsGateway();
	const engagement = await gw.engagement(params.courseId).catch(() => ({ lessons: 0, assignments: 0, submissions: 0 } as any));
	const grades = await gw.gradeDistribution(params.courseId).catch(() => ({ total: 0, average: 0, dist: [] } as any));

	const metrics = [
		{ id: 'avg', label: 'Average score', value: typeof (grades as any)?.average === 'number' ? `${(grades as any).average}%` : '—' },
		{ id: 'total', label: 'Total graded', value: typeof (grades as any)?.total === 'number' ? (grades as any).total : '—' },
		{ id: 'subs', label: 'Submissions', value: typeof (engagement as any)?.submissions === 'number' ? (engagement as any).submissions : '—' },
	];
	const distribution = Array.isArray((grades as any)?.dist) ? (grades as any).dist.map((b: any) => ({ bucket: b.bucket, count: b.count })) : [];

	return (
		<section className="p-6 space-y-4" aria-label="Course analytics">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Analytics" }]} />
			<TeacherAnalytics header={{ title: 'Course analytics' }} metrics={metrics} distribution={distribution} exportHref={`/api/reports/grade-distribution?course_id=${encodeURIComponent(params.courseId)}&format=csv`} />
		</section>
	);
}


