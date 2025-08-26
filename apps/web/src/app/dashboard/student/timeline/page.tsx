import { createEnrollmentsGateway } from "@/lib/data/enrollments";
import { createLessonsGateway } from "@/lib/data/lessons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import StudentTimeline from "@/ui/v0/StudentTimeline";

type Enrollment = { id: string; course_id: string };

type Lesson = { id: string; title: string; order_index: number; content?: string };

function distributeOverSevenDays(totalMinutes: number): number[] {
	const base = Math.floor(Math.max(0, totalMinutes) / 7);
	const rem = Math.max(0, totalMinutes) % 7;
	const days = Array(7).fill(base);
	for (let i = 0; i < rem; i++) days[i] += 1;
	return days;
}

function buildCsv(rows: { course_id: string; days: number[]; total: number }[]) {
	const lines: string[] = [];
	const header = ["course_id", "day_1", "day_2", "day_3", "day_4", "day_5", "day_6", "day_7", "total"];
	lines.push(header.join(","));
	for (const r of rows) lines.push([r.course_id, ...r.days.map(String), String(r.total)].join(","));
	return `data:text/csv;charset=utf-8,${encodeURIComponent(lines.join("\n"))}`;
}

export default async function StudentTimelinePage() {
	let enrollments: Enrollment[] = [];
	try { enrollments = await createEnrollmentsGateway().list() as any; } catch {}
	const perCourse = await Promise.all((enrollments ?? []).map(async (e) => {
		let lessons: Lesson[] = [];
		try { lessons = await createLessonsGateway().listByCourse(e.course_id) as any; } catch {}
		const totalChars = (Array.isArray(lessons) ? lessons : []).reduce((sum, l) => sum + ((l.content ?? "").length), 0);
		const totalMinutes = Math.ceil(totalChars / 1000);
		const days = distributeOverSevenDays(totalMinutes);
		return { course_id: e.course_id, days, total: totalMinutes };
	}));
	const totals = Array(7).fill(0);
	for (const r of perCourse) for (let i = 0; i < 7; i++) totals[i] += r.days[i];
	const grandTotal = totals.reduce((a, b) => a + b, 0);
	const csvHref = buildCsv(perCourse);
	const rows = perCourse.map((r) => ({ courseId: r.course_id, days: r.days, total: r.total }));
	return (
		<section className="p-6 space-y-3" aria-label="Timeline">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Timeline" }]} />
			<StudentTimeline rows={rows as any} totals={totals as any} grandTotal={grandTotal} csvHref={csvHref} />
		</section>
	);
}


