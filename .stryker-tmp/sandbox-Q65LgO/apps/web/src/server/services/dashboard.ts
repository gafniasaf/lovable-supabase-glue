// @ts-nocheck
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { listTestCoursesByTeacher, listTestEnrollmentsByStudent, listTestLessonsByCourse, listTestAssignmentsByCourse, listTestSubmissionsByAssignment } from "@/lib/testStore";
import { logger } from "@/lib/logger";
import { dashboardResponse } from "@education/shared";
import type { DashboardResponse } from "@education/shared";

type TeacherDashboardResponse = Extract<DashboardResponse, { role: "teacher" }>;
type StudentDashboardResponse = Extract<DashboardResponse, { role: "student" }>;
type AdminDashboardResponse = Extract<DashboardResponse, { role: "admin" }>;
type ParentDashboardResponse = Extract<DashboardResponse, { role: "parent" }>;

export async function getDashboardForUser(userId: string, role: "teacher"): Promise<TeacherDashboardResponse>;
export async function getDashboardForUser(userId: string, role: "student"): Promise<StudentDashboardResponse>;
export async function getDashboardForUser(userId: string, role: "admin"): Promise<AdminDashboardResponse>;
export async function getDashboardForUser(userId: string, role: "parent"): Promise<ParentDashboardResponse>;
export async function getDashboardForUser(userId: string, role: string): Promise<DashboardResponse>;
export async function getDashboardForUser(userId: string, role: string) {
  if (role === "teacher") return getTeacherDashboard(userId);
  if (role === "student") return getStudentDashboard(userId);
  if (role === "admin") return getAdminDashboard();
  return { role: "parent" as const, data: { children: [] as never[] } };
}

async function getTeacherDashboard(userId: string) {
  const t0 = Date.now();
  if (isTestMode()) {
    const courses = listTestCoursesByTeacher(userId);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function toUuidLike(input: string) {
      if (uuidRegex.test(input)) return input;
      let h1 = 0 >>> 0, h2 = 0 >>> 0, h3 = 0 >>> 0;
      for (let i = 0; i < input.length; i++) {
        const c = input.charCodeAt(i);
        h1 = (Math.imul(h1 ^ c, 2654435761) >>> 0);
        h2 = (Math.imul(h2 ^ c, 1597334677) >>> 0);
        h3 = (Math.imul(h3 ^ c, 374761393) >>> 0);
      }
      const hex = (h1.toString(16) + h2.toString(16) + h3.toString(16)).padStart(12, '0').slice(0, 12);
      return `00000000-0000-0000-0000-${hex}`;
    }
    // Compute ungraded submissions across teacher's courses
    let ungraded = 0;
    for (const c of courses) {
      const assigns = (listTestAssignmentsByCourse as any)(c.id) as any[];
      for (const a of (assigns ?? [])) {
        const subs = (listTestSubmissionsByAssignment as any)(a.id) as any[];
        ungraded += (subs ?? []).filter((s: any) => s.score == null).length;
      }
    }
    logger.debug({ ms: Date.now() - t0 }, "dash_teacher_widgets");
    return dashboardResponse.parse({
      role: "teacher",
      data: {
        kpis: { activeCourses: { label: "Active Courses", value: courses.length }, studentsEnrolled: { label: "Students", value: 0 }, needsGrading: { label: 'Needs grading', value: ungraded } },
        recentCourses: courses.slice(0, 5).map((c) => ({ id: toUuidLike(c.id), title: c.title, createdAt: c.created_at }))
      }
    });
  }
  const supabase = getRouteHandlerSupabase();
  const [{ data, error }] = await Promise.all([
    supabase.from("courses").select("id,title,created_at").eq("teacher_id", userId).order("created_at", { ascending: false }).limit(5)
  ]);
  const courseIds = (data ?? []).map((c: any) => c.id);
  let needsCount = 0;
  let studentsEnrolled = 0;
  let interactiveAttempts = 0;
  let interactivePassRate = 0;
  if (courseIds.length > 0) {
    const { data: assigns } = await supabase.from('assignments').select('id').in('course_id', courseIds);
    const aIds = (assigns ?? []).map((a: any) => a.id);
    if (aIds.length > 0) {
      const { count } = await supabase.from('submissions').select('id', { count: 'estimated', head: true }).is('score', null).in('assignment_id', aIds);
      needsCount = count ?? 0;
    }
    // Distinct enrolled students across teacher's courses
    try {
      const { data: enr } = await supabase
        .from('enrollments')
        .select('student_id,course_id')
        .in('course_id', courseIds)
        .limit(10000);
      const unique = new Set<string>((enr ?? []).map((r: any) => r.student_id as string));
      studentsEnrolled = unique.size;
    } catch {}
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: ia } = await supabase
      .from('interactive_attempts')
      .select('score,max,passed,created_at')
      .in('course_id', courseIds)
      .gte('created_at', since);
    interactiveAttempts = (ia ?? []).length;
    const withScore = (ia ?? []).filter((r: any) => typeof r.score === 'number' && typeof r.max === 'number' && r.max > 0);
    if (withScore.length > 0) {
      const passed = withScore.filter((r: any) => !!r.passed).length;
      interactivePassRate = Math.round((passed / withScore.length) * 100);
    }
  }
  logger.info({ ms: Date.now() - t0 }, "dash_teacher_widgets");
  if (error) throw new Error(error.message);
  return dashboardResponse.parse({
    role: "teacher",
    data: {
      kpis: {
        activeCourses: { label: "Active Courses", value: (data ?? []).length },
        studentsEnrolled: { label: "Students", value: studentsEnrolled },
        needsGrading: { label: 'Needs grading', value: needsCount },
        interactiveAttempts: { label: 'Interactive attempts (24h)', value: interactiveAttempts },
        interactivePassRate: { label: 'Interactive pass % (24h)', value: interactivePassRate }
      },
      recentCourses: (data ?? []).map((c: any) => ({ id: c.id, title: c.title, createdAt: c.created_at }))
    }
  });
}

async function getStudentDashboard(userId: string) {
  const t0 = Date.now();
  if (isTestMode()) {
    const enrollments = listTestEnrollmentsByStudent(userId);
    const courseSummaries = enrollments.map((e) => {
      const lessons = listTestLessonsByCourse(e.course_id);
      const next = lessons.sort((a, b) => a.order_index - b.order_index)[0];
      return {
        courseId: e.course_id,
        title: next?.title ? `Course` : `Course`,
        totalLessons: lessons.length,
        nextLessonTitle: next?.title as string | undefined,
        nextLessonId: next?.id as string | undefined
      };
    });
    const continueLearning = courseSummaries[0]
      ? { courseId: courseSummaries[0].courseId, courseTitle: courseSummaries[0].title, nextLessonTitle: courseSummaries[0].nextLessonTitle, nextLessonId: courseSummaries[0].nextLessonId }
      : undefined;
    logger.debug({ ms: Date.now() - t0 }, "dash_student_widgets");
    return {
      role: "student" as const,
      data: {
        kpis: { enrolledCourses: { label: "Courses", value: enrollments.length }, lessonsCompleted: { label: "Lessons", value: 0 } },
        continueLearning,
        courses: courseSummaries.map((c) => ({
          courseId: c.courseId,
          title: c.title,
          progress: { totalLessons: c.totalLessons, completedLessons: 0, percent: 0 }
        }))
      }
    };
  }
  // Real mode: compute per-course progress and next incomplete lesson
  const supabase = getRouteHandlerSupabase();
  const { data: enr, error } = await supabase
    .from("enrollments")
    .select("course_id, enrolled_at")
    .eq("student_id", userId)
    .order("enrolled_at", { ascending: false })
    .limit(10);
  if (error) throw new Error(error.message);
  const enrollments = (enr ?? []) as { course_id: string; enrolled_at: string }[];
  const courseIds = Array.from(new Set(enrollments.map((e) => e.course_id)));
  if (courseIds.length === 0) {
    logger.info({ ms: Date.now() - t0 }, "dash_student_widgets");
    return dashboardResponse.parse({
      role: "student",
      data: {
        kpis: { enrolledCourses: { label: "Courses", value: 0 }, lessonsCompleted: { label: "Lessons", value: 0 } },
        continueLearning: undefined,
        courses: []
      }
    });
  }
  const [{ data: courseRows }, { data: lessonRows }] = await Promise.all([
    supabase.from("courses").select("id,title").in("id", courseIds),
    supabase.from("lessons").select("id,course_id,title,order_index").in("course_id", courseIds)
  ]);
  const lessonsByCourse = new Map<string, { id: string; title: string; order_index: number }[]>();
  const allLessonIds: string[] = [];
  for (const l of (lessonRows ?? []) as any[]) {
    allLessonIds.push(l.id);
    const arr = lessonsByCourse.get(l.course_id) ?? [];
    arr.push({ id: l.id, title: l.title, order_index: l.order_index });
    lessonsByCourse.set(l.course_id, arr);
  }
  for (const [cid, arr] of lessonsByCourse) arr.sort((a, b) => a.order_index - b.order_index);
  // Fetch student progress for these lessons
  let progressSet = new Set<string>();
  if (allLessonIds.length > 0) {
    const { data: progRows } = await supabase
      .from("progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .in("lesson_id", allLessonIds);
    progressSet = new Set((progRows ?? []).map((r: any) => r.lesson_id as string));
  }
  const titleByCourse = new Map<string, string>((courseRows ?? []).map((c: any) => [c.id, c.title]));
  const courseSummaries = courseIds.map((cid) => {
    const title = titleByCourse.get(cid) || "Course";
    const lessons = lessonsByCourse.get(cid) ?? [];
    const total = lessons.length;
    let completed = 0;
    let nextLessonTitle: string | undefined = undefined;
    for (const l of lessons) {
      if (progressSet.has(l.id)) completed += 1; else if (!nextLessonTitle) nextLessonTitle = l.title;
    }
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { courseId: cid, title, totalLessons: total, completedLessons: completed, percent, nextLessonTitle };
  });
  // Continue learning: first enrolled course with an incomplete lesson
  let continueLearning: { courseId: string; courseTitle: string; nextLessonTitle?: string; nextLessonId?: string } | undefined = undefined;
  for (const e of enrollments) {
    const s = courseSummaries.find((c) => c.courseId === e.course_id);
    if (s && (s.completedLessons < s.totalLessons)) {
      continueLearning = { courseId: s.courseId, courseTitle: s.title, nextLessonTitle: s.nextLessonTitle, nextLessonId: (lessonsByCourse.get(s.courseId)?.find(l => !progressSet.has(l.id))?.id) };
      break;
    }
  }
  logger.info({ ms: Date.now() - t0 }, "dash_student_widgets");
  return dashboardResponse.parse({
    role: "student",
    data: {
      kpis: { enrolledCourses: { label: "Courses", value: enrollments.length }, lessonsCompleted: { label: "Lessons", value: 0 } },
      continueLearning,
      courses: courseSummaries.map((s) => ({
        courseId: s.courseId,
        title: s.title,
        progress: { totalLessons: s.totalLessons, completedLessons: s.completedLessons, percent: s.percent }
      }))
    }
  });
}

async function getAdminDashboard() {
  if (isTestMode()) {
    return {
      role: "admin" as const,
      data: {
        kpis: {
          totalUsers: { label: "Users", value: 0 },
          totalCourses: { label: "Courses", value: 0 },
          dailyActiveUsers: { label: "DAU", value: 0 }
        },
        recentActivity: [
          { id: "act-1", message: "System healthy", at: new Date().toISOString() },
          { id: "act-2", message: "Smoke tests configured", at: new Date().toISOString() }
        ]
      }
    };
  }
  const supabase = getRouteHandlerSupabase();
  const t0 = Date.now();
  const [{ count: usersCount }, { count: coursesCount }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true })
  ]);
  logger.info({ ms: Date.now() - t0 }, "dash_admin_widgets");
  return dashboardResponse.parse({
    role: "admin",
    data: {
      kpis: {
        totalUsers: { label: "Users", value: usersCount ?? 0 },
        totalCourses: { label: "Courses", value: coursesCount ?? 0 },
        dailyActiveUsers: { label: "DAU", value: 0 }
      },
      recentActivity: []
    }
  });
}


