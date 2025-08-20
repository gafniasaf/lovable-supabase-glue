// @ts-nocheck
import Link from "next/link";

function formatBytes(n?: number) {
  const v = Number(n || 0);
  if (!Number.isFinite(v)) return '-';
  const units = ['B','KB','MB','GB','TB'];
  let i = 0, x = v;
  while (x >= 1024 && i < units.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default async function AdminQuotasPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/admin/quotas`, { cache: 'no-store' });
  const rows = await res.json().catch(() => [] as any[]);
  return (
    <section className="p-6 space-y-4" aria-label="Quotas">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Storage quotas</h1>
        <Link className="underline" href="/dashboard/admin">Back</Link>
      </div>
      <div className="flex items-center gap-2">
        <form className="flex items-center gap-2">
          <input name="q" placeholder="Search user id" className="border rounded px-2 py-1 text-sm" />
          <button className="underline text-sm" type="submit">Filter</button>
        </form>
      </div>
      <table className="w-full text-sm border mt-3">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">User</th>
            <th className="p-2 border">Max bytes</th>
            <th className="p-2 border">Used bytes</th>
            <th className="p-2 border">Updated</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(rows) && rows.map((r: any) => (
            <tr key={r.user_id} className="border-b">
              <td className="p-2 border font-mono text-xs">{r.user_id}</td>
              <td className="p-2 border">{formatBytes(r.max_bytes)} <span className="text-xs text-gray-400">({r.max_bytes ?? 0})</span></td>
              <td className="p-2 border">{formatBytes(r.used_bytes)} <span className="text-xs text-gray-400">({r.used_bytes ?? 0})</span></td>
              <td className="p-2 border">{r.updated_at ? new Date(r.updated_at).toLocaleString() : '-'}</td>
              <td className="p-2 border">
                <form action={async (formData: FormData) => {
                  'use server';
                  const id = String(formData.get('user_id') || '');
                  const max = Number(formData.get('max_bytes') || 0);
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/quotas`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user_id: id, max_bytes: max }) });
                }} className="flex items-center gap-2">
                  <input type="hidden" name="user_id" defaultValue={r.user_id} />
                  <input className="border rounded px-2 py-1 w-40" name="max_bytes" defaultValue={r.max_bytes || 0} />
                  <button className="underline text-sm" type="submit">Save</button>
                </form>
                <form action={async (formData: FormData) => {
                  'use server';
                  const id = String(formData.get('user_id') || '');
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/quotas`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user_id: id, action: 'reset_used' }) });
                }} className="mt-1">
                  <input type="hidden" name="user_id" defaultValue={r.user_id} />
                  <button className="text-xs underline" type="submit">Reset used</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


