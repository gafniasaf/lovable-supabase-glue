// @ts-nocheck
import { headers, cookies } from "next/headers";
import { createAssignmentsGateway } from "@/lib/data/assignments";

export default async function StudentAssignmentsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  try {
    const rows = await createAssignmentsGateway().listByCourse(params.courseId);
    return (
      <section className="p-6 space-y-3" aria-label="Assignments">
        <h1 className="text-xl font-semibold">Assignments</h1>
        <ol className="space-y-2" data-testid="student-assignments-list">
          {(rows ?? []).map((a: any) => (
            <li key={a.id} className="border rounded p-3" data-testid="student-assignment-row">
              <div className="font-medium">{a.title}</div>
              <div className="mt-1 text-sm text-gray-600">Due: {a.due_at ? new Date(a.due_at).toLocaleString() : '—'}</div>
              <div className="mt-2">
                <a className="underline text-sm" href={`/dashboard/student/${params.courseId}/assignments/${a.id}/submit`}>Open</a>
              </div>
            </li>
          ))}
          {(!rows || rows.length === 0) && (
            <li className="text-gray-500">No assignments yet.</li>
          )}
        </ol>
      </section>
    );
  } catch (e: any) {
    return (
      <section className="p-6" aria-label="Assignments">
        <p className="text-gray-700">{String(e?.message || e)}</p>
      </section>
    );
  }
}


