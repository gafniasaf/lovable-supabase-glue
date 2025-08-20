import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { headers } from "next/headers";
import { createTeacherProgressGateway } from "@/lib/data/teacherProgress";
import DataTable, { type Column } from "@/components/ui/DataTable";

export default async function TeacherEnrollmentsPage({ searchParams }: { searchParams?: { courseId?: string } }) {
	const courseId = (searchParams?.courseId || '').trim();
	let perStudent: Awaited<ReturnType<ReturnType<typeof createTeacherProgressGateway>['listPerStudent']>> = [] as any;
	if (courseId) {
		perStudent = await createTeacherProgressGateway().listPerStudent(courseId).catch(() => []);
	}
	return (
		<section className="p-6 space-y-4" aria-label="Enrollments">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Enrollments" }]} />
			<h1 className="text-xl font-semibold">Enrollments</h1>
			<form className="flex items-center gap-2" action="/dashboard/teacher/enrollments" method="get">
				<label className="text-sm" htmlFor="courseId">Course ID</label>
				<input id="courseId" name="courseId" className="border rounded p-2" defaultValue={courseId} placeholder="Enter course id" />
				<button className="underline text-sm" type="submit">Load</button>
			</form>
			{!courseId ? (
				<div className="text-gray-600">Enter a course id to view enrollments.</div>
			) : (
				<DataTable
					columns={[
						{ key: 'name', header: 'Student', render: (r: any) => r.name ?? r.student_id },
						{ key: 'completedLessons', header: 'Completed' },
						{ key: 'totalLessons', header: 'Total' },
						{ key: 'percent', header: 'Percent', render: (r: any) => `${r.percent}%` }
					] as Column<any>[]}
					rows={(perStudent as any[]) || []}
					empty={<span>No enrollments yet.</span>}
				/>
			)}
		</section>
	);
}
