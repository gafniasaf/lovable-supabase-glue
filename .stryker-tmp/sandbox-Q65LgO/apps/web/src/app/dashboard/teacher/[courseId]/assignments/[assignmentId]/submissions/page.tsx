// @ts-nocheck
import { createSubmissionsGateway } from "@/lib/data/submissions";
import { redirect } from "next/navigation";
import GradeRowClient from "./GradeRowClient";
import Link from "next/link";

type Params = { courseId: string; assignmentId: string };

export default async function TeacherSubmissionsPage({ params }: { params: Params }) {
  const rows = await createSubmissionsGateway().listByAssignment(params.assignmentId).catch(() => []);

  return (
    <section className="p-6 space-y-4" aria-label="Submissions">
      <h1 className="text-xl font-semibold">Submissions</h1>
      <table className="w-full border" data-testid="submissions-list">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Student</th>
            <th className="p-2">Submitted</th>
            <th className="p-2">Attachments</th>
            <th className="p-2">Score</th>
            <th className="p-2">Feedback</th>
            <th className="p-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((s: any) => (
            <tr key={s.id} className="border-t" data-testid="submission-row">
              <td className="p-2" data-testid="submission-student">{s.student_id}</td>
              <td className="p-2">{s.submitted_at}</td>
              <td className="p-2 align-top">
                {s.file_urls && Array.isArray(s.file_urls) && s.file_urls.length > 0 ? (
                  <ul className="list-disc ml-4 space-y-1">
                    {s.file_urls.map((key: string, idx: number) => {
                      const m: any = {};
                      const icon = !m?.content_type ? '📎' : (m.content_type.startsWith('image/') ? '🖼️' : (m.content_type === 'application/pdf' ? '📄' : '📎'));
                      const href = `/api/files/download-url?id=${encodeURIComponent(key)}`;
                      return (
                        <li key={`${s.id}-${idx}`}>
                          <div className="flex items-center gap-2">
                            <span>{icon}</span>
                            <a className="underline" href={href} target="_blank" rel="noreferrer">{`Attachment ${idx+1}`}</a>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  s.file_url ? (
                    <a className="underline" href={s.file_url} target="_blank" rel="noreferrer" data-testid="submission-file-link">Attachment</a>
                  ) : <span className="text-gray-500">-</span>
                )}
              </td>
              <td className="p-2" data-testid="submission-score">{s.score ?? "-"}</td>
              <td className="p-2" data-testid="submission-feedback">{s.feedback ?? "-"}</td>
              <td className="p-2">
                <GradeRowClient id={s.id} initialScore={s.score ?? null} initialFeedback={s.feedback ?? null} />
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={6}>No submissions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      {rows.length > 0 ? (
        <div className="mt-3 flex items-center gap-3 text-sm">
          <Link className="underline" href={`/dashboard/teacher/${params.courseId}/assignments/${params.assignmentId}/submissions?nav=prev`}>Previous</Link>
          <Link className="underline" href={`/dashboard/teacher/${params.courseId}/assignments/${params.assignmentId}/submissions?nav=next`}>Next</Link>
        </div>
      ) : null}
      <a className="underline" href={`/dashboard/teacher/${params.courseId}/assignments`}>Back to assignments</a>
    </section>
  );
}


