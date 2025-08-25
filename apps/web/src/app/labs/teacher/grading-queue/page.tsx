import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createGradingGateway } from "@/lib/data/grading";
import { createCoursesGateway } from "@/lib/data/courses";
import { createSubmissionsGateway } from "@/lib/data/submissions";

export default async function GradingQueueLabPage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const courseId = (searchParams?.course_id || '').trim();
  const courses = await createCoursesGateway().listForTeacher().catch(() => [] as any[]);
  let assignments: any[] = [];
  if (courseId) {
    assignments = await createGradingGateway().listAssignmentsForCourse(courseId).catch(() => [] as any[]);
  }

  async function gradeAction(formData: FormData) {
    "use server";
    const id = String(formData.get('submission_id') || '').trim();
    const score = Number(formData.get('score') || 0);
    if (!id) return;
    await (await import("@/lib/data/submissions")).createSubmissionsGateway().grade(id, { score } as any);
    revalidatePath('/labs/teacher/grading-queue');
  }

  return (
    <section className="p-6 space-y-4" aria-label="Grading Queue (labs)">
      <h1 className="text-xl font-semibold">Grading Queue (labs)</h1>
      <div className="text-sm text-gray-600">Select a course to view assignments and grade submissions.</div>
      <div>
        <label htmlFor="labs-course-select" className="text-sm mr-2">Course</label>
        <select id="labs-course-select" className="border rounded p-1" name="course_id" defaultValue={courseId} onChange={() => {}}>
          <option value="">Select…</option>
          {courses.map((co: any) => (<option key={co.id} value={co.id}>{co.title}</option>))}
        </select>
      </div>
      {assignments.length > 0 && (
        <div className="space-y-3">
          {assignments.map((a: any) => (
            <AssignmentBlock key={a.id} assignmentId={a.id} gradeAction={gradeAction} />
          ))}
        </div>
      )}
    </section>
  );
}

async function AssignmentBlock({ assignmentId, gradeAction }: { assignmentId: string; gradeAction: (fd: FormData) => Promise<void> }) {
  const rows = await createSubmissionsGateway().listByAssignment(assignmentId).catch(() => [] as any[]);
  return (
    <section className="border rounded p-3">
      <h2 className="font-medium mb-2">Assignment {assignmentId}</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-50"><th className="p-2 border">Submission</th><th className="p-2 border">Score</th><th className="p-2 border">Action</th></tr>
        </thead>
        <tbody>
          {rows.map((s: any) => (
            <tr key={s.id} className="border">
              <td className="p-2 border">{s.id}</td>
              <td className="p-2 border">{s.score ?? '-'}</td>
              <td className="p-2 border">
                <form action={gradeAction} className="flex items-center gap-2">
                  <input type="hidden" name="submission_id" value={s.id} />
                  <input className="border rounded p-1 w-20" name="score" type="number" min={0} max={100} defaultValue={s.score ?? 0} />
                  <button className="underline text-sm">Save</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


