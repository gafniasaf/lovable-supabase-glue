import { createEnrollmentsGateway } from "@/lib/data/enrollments";
import { createLessonsGateway } from "@/lib/data/lessons";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import StudentPlanner from "@/ui/v0/StudentPlanner";

type Enrollment = { id: string; course_id: string };

type Lesson = { id: string; title: string; order_index: number; content?: string };

export default async function StudentPlannerPage() {
	let enrollments: Enrollment[] = [];
	try { enrollments = await createEnrollmentsGateway().list() as any; } catch {}
	const details = await Promise.all((enrollments ?? []).map(async (e) => {
		let lessons: Lesson[] = [];
		try { lessons = await createLessonsGateway().listByCourse(e.course_id) as any; } catch {}
		const lessonCount = Array.isArray(lessons) ? lessons.length : 0;
		const next = (Array.isArray(lessons) ? [...lessons] : []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))[0];
		const totalChars = (Array.isArray(lessons) ? lessons : []).reduce((sum, l) => sum + ((l.content ?? "").length), 0);
		const roughReadingTimeMin = Math.ceil(totalChars / 1000);
		return { course_id: e.course_id, lessonCount, nextUpTitle: next?.title ?? "", roughReadingTimeMin };
	}));
	const items = details.map((d) => ({ courseId: d.course_id, lessonCount: d.lessonCount, nextUpTitle: d.nextUpTitle, readingTimeMin: d.roughReadingTimeMin, href: `/dashboard/student/${d.course_id}` }));
	return (
		<section className="p-6 space-y-4" aria-label="Planner">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Planner" }]} />
			<StudentPlanner header={{ title: 'Study planner' }} items={items as any} />
		</section>
	);
}


