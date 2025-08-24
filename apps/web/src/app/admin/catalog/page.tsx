"use client";
import { useEffect, useMemo, useState } from "react";

type ExternalCourse = { id: string; vendor_id: string; kind: string; title: string; description?: string; status: string; version: string; created_at?: string };

export default function CatalogAdminPage() {
  const [rows, setRows] = useState<ExternalCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/registry/courses', { cache: 'no-store', headers: { 'x-test-auth': 'admin' } as any });
      const json = await res.json();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows(Array.isArray(json) ? json as ExternalCourse[] : []);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(r => [r.title, r.description, r.version, r.kind, r.status].some(v => (v || '').toLowerCase().includes(term)));
  }, [rows, q]);

  async function updateStatus(id: string, status: 'approved' | 'disabled' | 'draft') {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`/api/registry/courses?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'admin' } as any, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  return (
    <section className="p-6 space-y-4" aria-label="External Catalog">
      <h1 className="text-xl font-semibold">External Catalog</h1>
      <div className="flex items-center gap-2">
        <input className="border rounded px-2 py-1 w-[360px]" placeholder="Search by title/desc/version/kind/status" value={q} onChange={e => setQ(e.target.value)} />
        <button className="px-3 py-1 border rounded" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Reload'}</button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="border px-2 py-1 text-left">Title</th>
            <th className="border px-2 py-1 text-left">Version</th>
            <th className="border px-2 py-1 text-left">Kind</th>
            <th className="border px-2 py-1 text-left">Status</th>
            <th className="border px-2 py-1 text-left">Created</th>
            <th className="border px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td className="p-2 text-gray-500" colSpan={6}>No courses</td></tr>
          ) : filtered.map(c => (
            <tr key={c.id} className="border-t">
              <td className="border px-2 py-1">{c.title}</td>
              <td className="border px-2 py-1">{c.version}</td>
              <td className="border px-2 py-1 uppercase">{c.kind}</td>
              <td className="border px-2 py-1 capitalize">{c.status}</td>
              <td className="border px-2 py-1">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
              <td className="border px-2 py-1">
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded" disabled={loading || c.status === 'approved'} onClick={() => updateStatus(c.id, 'approved')}>Approve</button>
                  <button className="px-2 py-1 border rounded" disabled={loading || c.status === 'disabled'} onClick={() => updateStatus(c.id, 'disabled')}>Disable</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


