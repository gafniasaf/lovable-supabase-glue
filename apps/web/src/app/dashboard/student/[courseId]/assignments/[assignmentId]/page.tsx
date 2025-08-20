import { createAssignmentsGateway } from "@/lib/data/assignments";
import { createSubmissionsGateway } from "@/lib/data/submissions";
import { getCurrentUser } from "@/lib/supabaseServer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";

type Params = { courseId: string; assignmentId: string };

export default async function StudentAssignmentDetailPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <section className="p-6" aria-label="Assignment">
        <p><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }

  const list = await createAssignmentsGateway().listByCourse(params.courseId).catch(() => [] as any[]);
  const assignment = (list as any[]).find(a => a.id === params.assignmentId) as any | undefined;
  const subs = await createSubmissionsGateway().listByAssignment(params.assignmentId).catch(() => [] as any[]);
  const mine = (subs as any[]).filter(s => s.student_id === user.id);
  mine.sort((a, b) => (b.submitted_at || '').localeCompare(a.submitted_at || ''));
  const latest = mine[0] || null;

  return (
    <section className="p-6 space-y-4" aria-label="Assignment">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Assignments", href: `/dashboard/student/${params.courseId}/assignments` }, { label: "Detail" }]} />
      <h1 className="text-xl font-semibold">{assignment?.title ?? 'Assignment'}</h1>
      <div className="text-sm text-gray-600">Due: {assignment?.due_at ? new Date(assignment.due_at).toLocaleString() : '—'}</div>
      {assignment?.description ? (<p className="text-gray-800">{assignment.description}</p>) : null}

      <section className="border rounded p-3 space-y-1">
        <div className="font-medium">Your status</div>
        <div className="text-sm">Submitted: {latest?.submitted_at ? new Date(latest.submitted_at).toLocaleString() : 'Not submitted'}</div>
        <div className="text-sm">Score: {latest?.score ?? '—'}</div>
        <div className="text-sm">Feedback: {latest?.feedback ?? '—'}</div>
        <div className="mt-2">
          <a className="underline text-sm" href={`/dashboard/student/${params.courseId}/assignments/${params.assignmentId}/submit`}>Submit / Resubmit</a>
        </div>
      </section>

      <a className="underline" href={`/dashboard/student/${params.courseId}/assignments`}>Back to assignments</a>
    </section>
  );
}


