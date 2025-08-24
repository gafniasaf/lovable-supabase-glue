"use client";
import { useEffect, useMemo, useState } from "react";

type Version = { id: string; external_course_id: string; version: string; status: string; launch_url?: string; created_at?: string };

export default function VersionsAdminPage() {
  const [rows, setRows] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (courseId) qs.set('external_course_id', courseId);
      const res = await fetch(`/api/registry/versions${qs.toString() ? `?${qs.toString()}` : ''}`, { cache: 'no-store', headers: { 'x-test-auth': 'admin' } as any });
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows(Array.isArray(json) ? json as Version[] : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r => [r.version, r.status, r.launch_url].some(v => (v || '').toLowerCase().includes(term)));
  }, [rows, q]);

  async function updateStatus(id: string, status: 'approved' | 'disabled') {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/registry/versions?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'admin' } as any, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  return (
    <section className="p-6 space-y-4" aria-label="Course Versions">
      <h1 className="text-xl font-semibold">Course Versions</h1>
      <div className="flex items-center gap-2">
        <input className="border rounded px-2 py-1 w-[340px]" placeholder="Filter text (version/status/url)" value={q} onChange={e => setQ(e.target.value)} />
        <input className="border rounded px-2 py-1 w-[360px]" placeholder="external_course_id (UUID)" value={courseId} onChange={e => setCourseId(e.target.value)} />
        <button className="px-3 py-1 border rounded" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Reload'}</button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-1 text-left">Version</th>
            <th className="border px-2 py-1 text-left">Status</th>
            <th className="border px-2 py-1 text-left">Launch URL</th>
            <th className="border px-2 py-1 text-left">Created</th>
            <th className="border px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td className="p-2 text-gray-500" colSpan={5}>No versions</td></tr>
          ) : filtered.map(v => (
            <tr key={v.id} className="border-t">
              <td className="border px-2 py-1">{v.version}</td>
              <td className="border px-2 py-1 capitalize">{v.status}</td>
              <td className="border px-2 py-1 truncate max-w-[320px]"><a className="underline" href={v.launch_url || '#'} target="_blank" rel="noreferrer">{v.launch_url || '-'}</a></td>
              <td className="border px-2 py-1">{v.created_at ? new Date(v.created_at).toLocaleString() : '-'}</td>
              <td className="border px-2 py-1">
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => updateStatus(v.id, 'approved')} disabled={loading || v.status === 'approved'}>Approve</button>
                  <button className="px-2 py-1 border rounded" onClick={() => updateStatus(v.id, 'disabled')} disabled={loading || v.status === 'disabled'}>Disable</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


