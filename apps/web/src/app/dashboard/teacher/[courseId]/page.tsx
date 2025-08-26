import { getServerComponentSupabase, getCurrentUser } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { getTestCourse, listTestLessonsByCourse } from "@/lib/testStore";
import { createLessonsGateway } from "@/lib/data/lessons";
import { createCoursesGateway } from "@/lib/data/courses";
import { createTeacherProgressGateway } from "@/lib/data/teacherProgress";
import { createInteractiveOutcomesGateway } from "@/lib/data/interactiveOutcomes";
import Trans from "@/lib/i18n/Trans";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import TeacherCourseOverview from "@/ui/v0/TeacherCourseOverview";
// Avoid Next Link here to prevent client hook usage in SSR; use plain anchors instead

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const supabase = getServerComponentSupabase();
  const user = await getCurrentUser();
  if (!user && !isTestMode()) return <section className="p-6" aria-label="Course"><span><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></span></section>;

  let course: any = null;
  let lessons: any[] = [];
  let counts: Record<string, number> = {};
  let perStudent: { student_id: string; completedLessons: number; totalLessons: number; percent: number; name?: string }[] = [];
  let interactive: any[] = [];
  if (isTestMode()) {
    try {
      const list = await createCoursesGateway().listForTeacher().catch(() => [] as any[]);
      course = (list as any[]).find((c: any) => c.id === params.courseId) ?? getTestCourse(params.courseId) ?? { id: params.courseId, title: 'Course', description: null } as any;
    } catch {
      course = getTestCourse(params.courseId) ?? { id: params.courseId, title: 'Course', description: null } as any;
    }
    try {
      lessons = await createLessonsGateway().listByCourse(params.courseId).catch(() => listTestLessonsByCourse(params.courseId) as any[]);
    } catch {
      lessons = listTestLessonsByCourse(params.courseId) as any[];
    }
  } else {
    const courseRes = await supabase
      .from("courses")
      .select("id,title,description,created_at")
      .eq("id", params.courseId)
      .single();
    course = courseRes.data;
    const [list, countsMap, perStudents, ia] = await Promise.all([
      createLessonsGateway().listByCourse(params.courseId).catch(() => []),
      createTeacherProgressGateway().getCountsByLesson(params.courseId).catch(() => ({} as Record<string, number>)),
      createTeacherProgressGateway().listPerStudent(params.courseId).catch(() => []),
      createInteractiveOutcomesGateway().listRecentForCourse(params.courseId).catch(() => [])
    ]);
    counts = countsMap || {};
    lessons = (list as any[]).map((l: any) => ({ ...l }));
    perStudent = perStudents || [];
    interactive = ia || [];
  }

  const tabLinks = [
    { id: 'overview', label: 'Overview', href: `/dashboard/teacher/${params.courseId}`, current: true },
    { id: 'lessons', label: 'Lessons', href: `/dashboard/teacher/${params.courseId}/lessons/manage` },
    { id: 'modules', label: 'Modules', href: `/dashboard/teacher/${params.courseId}/modules` },
    { id: 'assignments', label: 'Assignments', href: `/dashboard/teacher/${params.courseId}/assignments` },
    { id: 'quizzes', label: 'Quizzes', href: `/dashboard/teacher/${params.courseId}/quizzes` },
    { id: 'analytics', label: 'Analytics', href: `/dashboard/teacher/${params.courseId}/analytics` },
  ];
  const actions = [
    { id: 'new-lesson', label: 'New lesson', href: `/dashboard/teacher/${params.courseId}/lessons/new` },
    { id: 'new-assignment', label: 'New assignment', href: `/dashboard/teacher/${params.courseId}/assignments/new` },
    { id: 'view-student', label: 'View as student', href: `/dashboard/student/${params.courseId}` },
  ];
  const header = { title: course?.title ?? 'Course', description: course?.description ?? null, tabLinks, actions };
  const lessonItems = (lessons ?? []).map((l: any) => ({ id: l.id, order: l.order_index, title: l.title, completedCount: counts[l.id] || 0 }));
  const perStudentRows = (perStudent ?? []).map((s) => ({ id: s.student_id, name: s.name ?? s.student_id, completed: s.completedLessons, total: s.totalLessons, percent: s.percent }));
  const attempts = (interactive ?? []).map((r: any) => ({ id: r.id, userId: r.user_id, score: r.score, max: r.max, passed: r.passed, pct: r.pct, topic: r.topic, at: r.created_at }));
  const state: 'default' | 'empty' = (lessonItems.length === 0 && perStudentRows.length === 0 && attempts.length === 0) ? 'empty' : 'default';

  return (
    <section className="p-6 space-y-3" aria-label="Course">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: header.title }]} />
      <TeacherCourseOverview header={header} lessons={lessonItems} perStudent={perStudentRows} attempts={attempts} state={state} />
      <div className="text-sm"><a className="underline" href={`/api/runtime/outcomes/export?course_id=${params.courseId}`}><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a></div>
      <a className="underline" href="/dashboard/teacher"><Trans keyPath="common.backToCourses" fallback="Back to courses" /></a>
    </section>
  );
}


