import { getServerComponentSupabase, getCurrentUser } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { getTestCourse, listTestLessonsByCourse } from "@/lib/testStore";
import { createLessonsGateway } from "@/lib/data/lessons";
import { createTeacherProgressGateway } from "@/lib/data/teacherProgress";
import { createInteractiveOutcomesGateway } from "@/lib/data/interactiveOutcomes";
import Trans from "@/lib/i18n/Trans";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
// Avoid Next Link here to prevent client hook usage in SSR; use plain anchors instead

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const supabase = getServerComponentSupabase();
  const user = await getCurrentUser();
  if (!user) return <section className="p-6" aria-label="Course"><span><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></span></section>;

  let course: any = null;
  let lessons: any[] = [];
  let counts: Record<string, number> = {};
  let perStudent: { student_id: string; completedLessons: number; totalLessons: number; percent: number; name?: string }[] = [];
  let interactive: any[] = [];
  if (isTestMode()) {
    course = getTestCourse(params.courseId) ?? { id: params.courseId, title: 'Course', description: null } as any;
    lessons = listTestLessonsByCourse(params.courseId) as any[];
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

  return (
    <section className="p-6 space-y-3" aria-label="Course">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: course?.title ?? "Course" }]} />
      <Tabs>
        <TabList>
          <Tab href={`/dashboard/teacher/${params.courseId}`} active>Overview</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`}>Lessons</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/modules`}>Modules</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/assignments`}>Assignments</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`}>Quizzes</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
        </TabList>
      </Tabs>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{course?.title}</h1>
        <div className="space-x-4">
          <a className="underline" href={`/dashboard/teacher/${params.courseId}/lessons/new`}>New lesson</a>
          <a className="underline" href={`/dashboard/teacher/${params.courseId}/assignments/new`}>New assignment</a>
          <a className="underline" href={`/dashboard/student/${params.courseId}`}>View as student</a>
        </div>
      </div>
      <p className="text-gray-600">{course?.description}</p>
      <h2 className="font-medium mt-4">Lessons</h2>
      {!lessons ? (
        <div className="space-y-2">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-10 w-full" />
        </div>
      ) : null}
      <ul className="space-y-2">
        {(lessons ?? []).map(l => (
          <li key={l.id} className="border rounded p-2 flex items-center justify-between">
            <span>#{l.order_index} - {l.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">completed by {counts[l.id] || 0}</span>
            <form action={async () => {
              "use server";
              const { createLessonsGateway } = await import("@/lib/data/lessons");
              await createLessonsGateway().markComplete(l.id);
            }}>
              <button type="submit" className="text-sm underline">Mark complete</button>
            </form>
          </li>
        ))}
        {(!lessons || lessons.length === 0) && <li className="text-gray-500">No lessons yet.</li>}
      </ul>
      <h2 className="font-medium mt-6">Student progress</h2>
      {(!perStudent || perStudent.length === 0) ? (
        <div className="text-gray-500">No enrolled students yet.</div>
      ) : (
        <table className="w-full text-sm border mt-2">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Completed</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Percent</th>
            </tr>
          </thead>
          <tbody>
            {perStudent.map((s) => (
              <tr key={s.student_id} className="border-b">
                <td className="p-2 border">{s.name ?? s.student_id}</td>
                <td className="p-2 border">{s.completedLessons}</td>
                <td className="p-2 border">{s.totalLessons}</td>
                <td className="p-2 border">{s.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 className="font-medium mt-6">Interactive attempts</h2>
      <div className="text-sm"><a className="underline" href={`/api/runtime/outcomes/export?course_id=${params.courseId}`}><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a></div>
      {(!interactive || interactive.length === 0) ? (
        <div className="text-gray-500">No interactive attempts yet.</div>
      ) : (
        <table className="w-full text-sm border mt-2">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Score</th>
              <th className="p-2 border">Max</th>
              <th className="p-2 border">Passed</th>
              <th className="p-2 border">Pct</th>
              <th className="p-2 border">Topic</th>
              <th className="p-2 border">At</th>
            </tr>
          </thead>
          <tbody>
            {interactive.map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 border font-mono text-xs">{r.user_id}</td>
                <td className="p-2 border">{r.score ?? '-'}</td>
                <td className="p-2 border">{r.max ?? '-'}</td>
                <td className="p-2 border">{r.passed == null ? '-' : (r.passed ? 'Yes' : 'No')}</td>
                <td className="p-2 border">{r.pct == null ? '-' : `${r.pct}%`}</td>
                <td className="p-2 border">{r.topic ?? '-'}</td>
                <td className="p-2 border">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <a className="underline" href="/dashboard/teacher"><Trans keyPath="common.backToCourses" fallback="Back to courses" /></a>
    </section>
  );
}


