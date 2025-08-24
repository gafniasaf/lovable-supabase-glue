import { NextRequest, NextResponse } from "next/server";
import { isTestMode } from "@/lib/testMode";
import { resetTestStore, addTestCourse, addTestLesson, addTestEnrollment, upsertTestProfile, addTestNotification, addTestAssignment, addTestSubmission } from "@/lib/testStore";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { withRouteTiming } from "@/server/withRouteTiming";

function makeId() {
  const hex = '0123456789abcdef';
  const rand = (n: number) => Array.from({ length: n }, () => hex[Math.floor(Math.random() * hex.length)]).join('');
  return `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
}

async function seed(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!isTestMode()) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Test mode only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  }
  const now = new Date().toISOString();
  const referer = req.headers.get('referer') || '/dashboard';
  const params = new URL(req.url).searchParams;
  const hard = params.get('hard') === '1';
  const namespace = params.get('namespace') || process.env.DEV_ID || '';

  if (hard) resetTestStore();

  // Seed synthetic users
  const teacherId = namespace ? `teacher-${namespace}` : 'test-teacher-id';
  const studentId = namespace ? `student-${namespace}` : 'test-student-id';
  const parentId = namespace ? `parent-${namespace}` : 'test-parent-id';
  upsertTestProfile({ id: teacherId, email: namespace ? `teacher_${namespace}@local.test` : 'teacher@example.com', role: 'teacher' });
  upsertTestProfile({ id: studentId, email: namespace ? `student_${namespace}@local.test` : 'student@example.com', role: 'student' });
  upsertTestProfile({ id: parentId, email: namespace ? `parent_${namespace}@local.test` : 'parent@example.com', role: 'parent' });

  // Seed courses for teacher
  const courseA = { id: namespace ? `course-${namespace}-A` : makeId(), title: namespace ? `Algebra (${namespace})` : 'Algebra I', description: 'Linear equations and functions', teacher_id: teacherId, created_at: now };
  const courseB = { id: namespace ? `course-${namespace}-B` : makeId(), title: namespace ? `Biology (${namespace})` : 'Biology Basics', description: 'Cells to ecosystems', teacher_id: teacherId, created_at: now };
  addTestCourse(courseA); addTestCourse(courseB);

  // Seed lessons
  addTestLesson({ id: makeId(), course_id: courseA.id, title: 'Variables and Expressions', content: 'Intro content', order_index: 1, created_at: now });
  addTestLesson({ id: makeId(), course_id: courseA.id, title: 'Linear Equations', content: 'Solve ax + b = c', order_index: 2, created_at: now });
  addTestLesson({ id: makeId(), course_id: courseB.id, title: 'Cell Structure', content: 'Organelles overview', order_index: 1, created_at: now });

  // Enroll student
  addTestEnrollment({ id: makeId(), student_id: studentId, course_id: courseA.id, created_at: now });
  addTestEnrollment({ id: makeId(), student_id: studentId, course_id: courseB.id, created_at: now });

  // Assignments
  const assign1 = { id: namespace ? `asg-${namespace}-1` : makeId(), course_id: courseA.id, title: namespace ? `HW 1 (${namespace})` : 'HW 1: Linear Equations', description: 'Solve the set', due_at: null, points: 100, created_at: now };
  const assign2 = { id: namespace ? `asg-${namespace}-2` : makeId(), course_id: courseA.id, title: namespace ? `HW 2 (${namespace})` : 'HW 2: Functions', description: 'Map inputs to outputs', due_at: null, points: 100, created_at: now };
  addTestAssignment(assign1); addTestAssignment(assign2);

  // Submissions
  addTestSubmission({ id: makeId(), assignment_id: assign1.id, student_id: studentId, text: 'Answers...', file_url: null, submitted_at: now, score: 95, feedback: 'Great work!' });

  // Notifications
  addTestNotification({ user_id: studentId, type: 'assignment:new', payload: { course_id: courseA.id, title: assign2.title } });
  addTestNotification({ user_id: studentId, type: 'message:new', payload: { from: 'Teacher A' } });

  // Optional DB seeds (best-effort) for new admin surfaces
  try {
    const supabase = getRouteHandlerSupabase();
    // usage_counters stub rows
    const day = now.slice(0, 10);
    await supabase.from('usage_counters').upsert({ day, provider_id: null, course_id: courseA.id, metric: 'runtime.progress', count: 3 } as any, { onConflict: 'day,provider_id,course_id,metric' } as any);
    await supabase.from('usage_counters').upsert({ day, provider_id: null, course_id: courseA.id, metric: 'runtime.grade', count: 1 } as any, { onConflict: 'day,provider_id,course_id,metric' } as any);
    // dead_letters one row
    await supabase.from('dead_letters').insert({ kind: 'runtime.event', payload: { sample: true } as any, error: 'timeout' } as any);
    // licenses sample
    await supabase.from('licenses').upsert({ provider_id: null, external_course_id: courseA.id, seats_total: 10, seats_used: 0, status: 'active' } as any);
  } catch {}

  const res = NextResponse.redirect(new URL(referer, req.url), 303);
  res.headers.set('x-request-id', requestId);
  return res;
}

export const POST = withRouteTiming(async function POST(req: NextRequest) { return seed(req); });

export const GET = withRouteTiming(async function GET(req: NextRequest) { return seed(req); });

export const dynamic = 'force-dynamic';


