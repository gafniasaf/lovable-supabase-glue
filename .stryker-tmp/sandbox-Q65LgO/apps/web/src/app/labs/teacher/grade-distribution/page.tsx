// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

export default async function GradeDistributionPage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const courseId = (searchParams?.course_id ?? '').trim();
  if (!courseId) return <section className="p-6" aria-label="Grade distribution (labs)">Provide ?course_id=...</section>;
  const res = await serverFetch(`/api/reports/grade-distribution?course_id=${encodeURIComponent(courseId)}`, { cache: 'no-store', headers: baseHeaders });
  const data = res.ok ? await res.json() : { total: 0, average: 0, dist: [] } as any;

  return (
    <section className="p-6 space-y-4" aria-label="Grade distribution (labs)">
      <h1 className="text-xl font-semibold">Grade distribution (labs)</h1>
      <div>Course: <span className="font-mono">{courseId}</span></div>
      <div className="text-sm">Total graded: {data.total} • Average: {data.average}</div>
      {(!data.dist || data.dist.length === 0) ? (
        <div className="text-gray-600">No data</div>
      ) : (
        <table className="text-sm border-collapse">
          <thead><tr><th className="text-left pr-4">Bucket</th><th className="text-left">Count</th></tr></thead>
          <tbody>
            {data.dist.map((r: any) => (
              <tr key={r.bucket}><td className="pr-4">{r.bucket}</td><td>{r.count}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      <a className="underline" href={`/api/reports/grade-distribution?course_id=${encodeURIComponent(courseId)}&format=csv`}><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
    </section>
  );
}


