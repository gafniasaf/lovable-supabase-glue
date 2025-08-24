"use client";
import { useEffect, useState } from "react";

type Engagement = { lessons: number; assignments: number; submissions: number };
type GradeDist = { total: number; average: number; dist: { bucket: string; count: number }[] };

export default function AdminReportsPage() {
  const [usageRows, setUsageRows] = useState<any[]>([]);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [engagementError, setEngagementError] = useState<string | null>(null);

  const [grade, setGrade] = useState<GradeDist | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);

  async function loadUsage() {
    setUsageLoading(true); setUsageError(null);
    try {
      const res = await fetch('/api/reports/usage', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUsageRows(Array.isArray(json.rows) ? json.rows : []);
    } catch (e: any) { setUsageError(String(e?.message || e)); }
    finally { setUsageLoading(false); }
  }

  async function loadEngagement() {
    setEngagementError(null);
    try {
      const res = await fetch('/api/reports/engagement', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEngagement(json as Engagement);
    } catch (e: any) { setEngagementError(String(e?.message || e)); }
  }

  async function loadGrade() {
    setGradeError(null);
    try {
      const res = await fetch('/api/reports/grade-distribution', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setGrade(json as GradeDist);
    } catch (e: any) { setGradeError(String(e?.message || e)); }
  }

  useEffect(() => {
    loadUsage();
    loadEngagement();
    loadGrade();
  }, []);

  return (
    <section className="p-6 space-y-4" aria-label="Admin Reports">
      <h1 className="text-xl font-semibold">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="KPI Tiles">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Lessons</div>
          <div className="text-2xl font-semibold">{engagement?.lessons ?? '-'}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Assignments</div>
          <div className="text-2xl font-semibold">{engagement?.assignments ?? '-'}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Submissions</div>
          <div className="text-2xl font-semibold">{engagement?.submissions ?? '-'}</div>
        </div>
      </div>
      {engagementError ? <div className="text-sm text-red-600">{engagementError}</div> : null}

      <div className="text-sm">
        <a className="underline" href="/api/reports/usage?format=csv" target="_blank" rel="noreferrer">Usage CSV</a>
        <span className="mx-2">·</span>
        <a className="underline" href="/api/reports/usage" target="_blank" rel="noreferrer">Usage JSON</a>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border rounded" onClick={() => { loadUsage(); loadEngagement(); loadGrade(); }} disabled={usageLoading}>{usageLoading ? 'Loading…' : 'Reload'}</button>
        {usageError ? <span className="text-sm text-red-600">{usageError}</span> : null}
        {gradeError ? <span className="text-sm text-red-600">{gradeError}</span> : null}
      </div>

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-1 text-left">Day</th>
            <th className="border px-2 py-1 text-left">Metric</th>
            <th className="border px-2 py-1 text-left">Course</th>
            <th className="border px-2 py-1 text-left">Provider</th>
            <th className="border px-2 py-1 text-left">Count</th>
          </tr>
        </thead>
        <tbody>
          {usageRows.length === 0 ? (
            <tr><td className="p-2 text-gray-500" colSpan={5}>No data</td></tr>
          ) : usageRows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="border px-2 py-1">{r.day}</td>
              <td className="border px-2 py-1">{r.metric}</td>
              <td className="border px-2 py-1">{r.course_id || '-'}</td>
              <td className="border px-2 py-1">{r.provider_id || '-'}</td>
              <td className="border px-2 py-1">{r.count ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


