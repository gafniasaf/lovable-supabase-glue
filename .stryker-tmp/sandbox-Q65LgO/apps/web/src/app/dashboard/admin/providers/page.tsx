// @ts-nocheck
import Link from "next/link";
import { createProvidersGateway } from "@/lib/data/providers";
import Trans from "@/lib/i18n/Trans";

export default async function AdminProvidersPage() {
  const gw = createProvidersGateway();
  const [rows, summaries] = await Promise.all([
    gw.list().catch(() => []),
    gw.healthSummaries().catch(() => ({} as any))
  ]);
  return (
    <section className="p-6 space-y-4" aria-label="Providers">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold"><Trans keyPath="admin.providers.title" fallback="Course providers" /></h1>
        <Link className="underline" href="/dashboard/admin"><Trans keyPath="common.back" fallback="Back" /></Link>
      </div>
      <NewProviderForm />
      <table className="w-full text-sm border mt-4">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.name" fallback="Name" /></th>
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.domain" fallback="Domain" /></th>
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.jwksUrl" fallback="JWKS URL" /></th>
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.health" fallback="Health" /></th>
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.created" fallback="Created" /></th>
            <th className="p-2 border"><Trans keyPath="admin.providers.columns.actions" fallback="Actions" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.domain}</td>
              <td className="p-2 border"><a className="underline" href={p.jwks_url} target="_blank" rel="noreferrer">{p.jwks_url}</a></td>
              <td className="p-2 border">
                <div className="flex items-center gap-2">
                  {(() => {
                    const s = (summaries as any)[p.id];
                    if (!s) return <span className="text-xs">—</span>;
                    const ok = s.jwks_ok && s.domain_ok;
                    const ts = s.checked_at ? new Date(s.checked_at).toLocaleString() : '';
                    const ttlMs = Number(process.env.PROVIDER_HEALTH_TTL_MS || 0);
                    const exp = s.checked_at && ttlMs ? new Date(new Date(s.checked_at).getTime() + ttlMs) : null;
                    const ttl = exp ? Math.max(0, Math.floor((exp.getTime() - Date.now())/1000)) : null;
                    return (
                      <span className={`text-xs inline-flex items-center gap-1 ${ok ? 'text-green-700' : 'text-red-700'}`} title={ts ? `Last checked: ${ts}` : ''}>
                        <span aria-hidden>{ok ? '●' : '●'}</span>
                        <span>{ok ? 'OK' : 'FAIL'}</span>
                        {ts ? <span className="text-gray-400">• {ts}</span> : null}
                        {ttl !== null ? <span className="text-gray-400">• TTL {ttl}s</span> : null}
                      </span>
                    );
                  })()}
                  <form action={async (formData: FormData) => {
                  "use server";
                  const id = String(formData.get('id') || '');
                  try {
                    const res = await createProvidersGateway().health(id);
                    console.log('provider_health', res);
                  } catch {}
                }}>
                    <input type="hidden" name="id" defaultValue={p.id} />
                    <button className="text-xs rounded px-2 py-0.5 border" type="submit"><Trans keyPath="admin.providers.buttons.refresh" fallback="Refresh" /></button>
                  </form>
                </div>
              </td>
              <td className="p-2 border">{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
              <td className="p-2 border">
                <form action={async (formData: FormData) => {
                  "use server";
                  const id = String(formData.get('id') || '');
                  const name = String(formData.get('name') || '');
                  const domain = String(formData.get('domain') || '');
                  const jwks_url = String(formData.get('jwks_url') || '');
                  await createProvidersGateway().update(id, { name, domain, jwks_url });
                }} className="flex items-center gap-2">
                  <input type="hidden" name="id" defaultValue={p.id} />
                  <input className="border rounded px-2 py-1 w-28" name="name" defaultValue={p.name} />
                  <input className="border rounded px-2 py-1 w-56" name="domain" defaultValue={p.domain} />
                  <input className="border rounded px-2 py-1 w-64" name="jwks_url" defaultValue={p.jwks_url} />
                  <button className="underline text-sm" type="submit"><Trans keyPath="common.save" fallback="Save" /></button>
                </form>
                <form action={async (formData: FormData) => {
                  "use server";
                  const id = String(formData.get('id') || '');
                  await createProvidersGateway().health(id);
                }} className="mt-1">
                  <input type="hidden" name="id" defaultValue={p.id} />
                  <button className="text-xs underline" type="submit"><Trans keyPath="admin.providers.buttons.checkHealth" fallback="Check health" /></button>
                </form>
                <form action={async (formData: FormData) => {
                  "use server";
                  const id = String(formData.get('id') || '');
                  try {
                    const res = await createProvidersGateway().health(id);
                    console.log('provider_health', res);
                  } catch {}
                }} className="mt-1">
                  <input type="hidden" name="id" defaultValue={p.id} />
                  <span className="text-xs text-gray-500"><Trans keyPath="admin.providers.hint.jwksReachable" fallback="JWKS reachable? Check logs" /></span>
                </form>
                <form action={async (formData: FormData) => {
                  "use server";
                  const id = String(formData.get('id') || '');
                  await createProvidersGateway().remove(id);
                }} className="mt-1">
                  <input type="hidden" name="id" defaultValue={p.id} />
                  <button className="text-red-600 underline text-sm" type="submit"><Trans keyPath="common.delete" fallback="Delete" /></button>
                </form>
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={4}><Trans keyPath="admin.providers.empty" fallback="No providers yet." /></td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function NewProviderForm() {
  return (
    <form action={async (formData: FormData) => {
      "use server";
      const name = String(formData.get('name') || '');
      const jwks_url = String(formData.get('jwks_url') || '');
      const domain = String(formData.get('domain') || '');
      await createProvidersGateway().create({ name, jwks_url, domain });
    }} className="border rounded p-4 space-y-2">
      <div className="font-medium"><Trans keyPath="admin.providers.add" fallback="Add provider" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border rounded px-2 py-1" name="name" placeholder="Name" required />
        <input className="border rounded px-2 py-1" name="domain" placeholder="https://provider.example" required />
        <input className="border rounded px-2 py-1" name="jwks_url" placeholder="https://provider.example/.well-known/jwks.json" required />
      </div>
      <button className="bg-black text-white rounded px-3 py-1" type="submit"><Trans keyPath="common.create" fallback="Create" /></button>
    </form>
  );
}


