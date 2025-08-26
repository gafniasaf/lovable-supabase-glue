import { headers, cookies } from "next/headers";
import { createAssignmentsGateway } from "@/lib/data/assignments";
import StudentAssignmentsList from "@/ui/v0/StudentAssignmentsList";

export default async function StudentAssignmentsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  try {
    const rows = await createAssignmentsGateway().listByCourse(params.courseId);
    const items = (rows || []).map((a: any) => ({ id: a.id, title: a.title, dueAt: a.due_at ?? null, href: `/dashboard/student/${params.courseId}/assignments/${a.id}/submit` }));
    const state: 'default' | 'empty' = (items.length === 0) ? 'empty' : 'default';
    return (
      <StudentAssignmentsList header={{ title: 'Assignments' }} items={items as any} state={state} />
    );
  } catch (e: any) {
    return (
      <section className="p-6" aria-label="Assignments">
        <p className="text-gray-700">{String(e?.message || e)}</p>
      </section>
    );
  }
}


