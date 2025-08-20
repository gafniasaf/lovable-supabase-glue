// @ts-nocheck
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { createProvidersGateway } from "@/lib/data/providers";
import { createRegistryGateway } from "@/lib/data/registry";

function isExternalCoursesEnabled() {
  return process.env.EXTERNAL_COURSES === '1';
}

export default async function AdminCatalogPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const h = headers();
  const c = cookies();
  const cookie = h.get('cookie') ?? c.getAll().map(x => `${x.name}=${x.value}`).join('; ');
  const testAuth = h.get('x-test-auth') ?? c.get('x-test-auth')?.value;
  if (!isExternalCoursesEnabled()) return (
    <section className="p-6" aria-label="Catalog">
      <h1 className="text-xl font-semibold">Course catalog</h1>
      <p className="text-gray-600 mt-2">External courses are disabled.</p>
      <Link className="underline mt-4 inline-block" href="/dashboard/admin">Back</Link>
    </section>
  );
  const q = (searchParams?.q as string) || '';
  const status = (searchParams?.status as string) || '';
  const kind = (searchParams?.kind as string) || '';
  const page = Math.max(1, Number((searchParams?.page as string) || 1));
  const pageSize = Math.min(100, Math.max(1, Number((searchParams?.page_size as string) || 20)));
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (kind) params.set('kind', kind);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const { rows, totalCount } = await createRegistryGateway().listCourses({ q, status, kind, page, page_size: pageSize }).catch(() => ({ rows: [] as any[], totalCount: 0 }));
  const totalPages = Math.max(1, Math.ceil((totalCount || rows.length) / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams(params.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === '') sp.delete(k);
      else sp.set(k, String(v));
    });
    const qs = sp.toString();
    return { pathname: '/dashboard/admin/catalog', query: Object.fromEntries(sp.entries()) } as any;
  };
  return (
    <section className="p-6 space-y-4" aria-label="Catalog">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Course catalog</h1>
        <Link className="underline" href="/dashboard/admin">Back</Link>
      </div>
      <form className="border rounded p-3 grid grid-cols-1 md:grid-cols-6 gap-2" action="/dashboard/admin/catalog" method="get">
        <input name="q" defaultValue={q} className="border rounded px-2 py-1 md:col-span-2" placeholder="Search title" />
        <select name="status" defaultValue={status} className="border rounded px-2 py-1">
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="approved">approved</option>
          <option value="disabled">disabled</option>
        </select>
        <select name="kind" defaultValue={kind} className="border rounded px-2 py-1">
          <option value="">All kinds</option>
          <option value="v2">v2</option>
          <option value="v1">v1</option>
        </select>
        <ProviderSelect defaultValue={(searchParams?.vendor_id as string) || ''} />
        <input type="hidden" name="page_size" value={String(pageSize)} />
        <button className="bg-black text-white rounded px-3 py-1" type="submit">Filter</button>
        <Link className="underline text-sm self-center" href="/dashboard/admin/catalog">Reset</Link>
      </form>
      <NewExternalCourseForm />
      <table className="w-full text-sm border mt-4">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Kind</th>
            <th className="p-2 border">Version</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Vendor</th>
            <th className="p-2 border w-64">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.id} className="border-b">
              <td className="p-2 border">{r.title}</td>
              <td className="p-2 border">{r.kind}</td>
              <td className="p-2 border">{r.version}</td>
              <td className="p-2 border"><span className={`px-2 py-0.5 rounded text-xs ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span></td>
              <td className="p-2 border">{r.vendor_id ? 'Assigned' : '—'}</td>
              <td className="p-2 border">
                <div className="flex items-center gap-2">
                  <Link className="underline" href={buildHref({ selected: r.id, panel: 'versions', page: 1 })}>Versions</Link>
                  <Link className="underline" href={buildHref({ selected: r.id, panel: 'edit', page: 1 })}>Edit</Link>
                  <AssignVendorForm id={r.id} />
                  <CourseActionForm id={r.id} actionType="approve" />
                  <CourseActionForm id={r.id} actionType="disable" />
                  <CourseActionForm id={r.id} actionType="delete" />
                </div>
              </td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={4}>No external courses yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Versions manager or Quick edit when a course is selected */}
      {searchParams?.selected && (!searchParams?.panel || String(searchParams.panel) === 'versions') ? (
        <VersionManager externalCourseId={String(searchParams.selected)} />
      ) : null}
      {searchParams?.selected && String(searchParams.panel) === 'edit' ? (
        <QuickEditCourseForm id={String(searchParams.selected)} />
      ) : null}

      {/* Providers management */}
      <ProviderManager />
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Page {page} of {totalPages} {totalCount ? `(total ${totalCount})` : ''}</div>
        <div className="space-x-3">
          {hasPrev ? (
            <Link className="underline" href={buildHref({ page: page - 1 })}>Prev</Link>
          ) : <span className="text-gray-400">Prev</span>}
          {hasNext ? (
            <Link className="underline" href={buildHref({ page: page + 1 })}>Next</Link>
          ) : <span className="text-gray-400">Next</span>}
        </div>
      </div>
    </section>
  );
}

async function ProviderSelect({ defaultValue }: { defaultValue: string }) {
  const providers = await createProvidersGateway().list().catch(() => [] as any[]);
  return (
    <select name="vendor_id" defaultValue={defaultValue} className="border rounded px-2 py-1">
      <option value="">All vendors</option>
      {providers.map((p: any) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}

function AssignVendorForm({ id }: { id: string }) {
  return (
    <form action={async (formData: FormData) => {
      'use server';
      if (process.env.EXTERNAL_COURSES !== '1') return;
      const vendor_id = String(formData.get('vendor_id') || '');
      const { createRegistryGateway } = await import("@/lib/data/registry");
      await createRegistryGateway().updateCourse(id, { vendor_id: vendor_id || null }).catch(() => {});
    }} className="flex items-center gap-1">
      <CompactProviderSelect />
      <button type="submit" className="px-2 py-0.5 rounded border text-xs border-gray-300 text-gray-700">Set</button>
    </form>
  );
}

async function CompactProviderSelect() {
  const providers = await createProvidersGateway().list().catch(() => [] as any[]);
  return (
    <select name="vendor_id" className="border rounded px-2 py-1 text-xs">
      <option value="">(no vendor)</option>
      {providers.map((p: any) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}

function CourseActionForm({ id, actionType }: { id: string; actionType: 'approve' | 'disable' | 'delete' }) {
  const label = actionType === 'approve' ? 'Approve' : actionType === 'disable' ? 'Disable' : 'Delete';
  return (
    <form action={async () => {
      'use server';
      if (process.env.EXTERNAL_COURSES !== '1') return;
      try {
        if (actionType === 'delete') {
          const { createRegistryGateway } = await import("@/lib/data/registry");
          await createRegistryGateway().deleteCourse(id).catch(() => {});
        } else {
          const status = actionType === 'approve' ? 'approved' : 'disabled';
          const { createRegistryGateway } = await import("@/lib/data/registry");
          await createRegistryGateway().updateCourse(id, { status }).catch(() => {});
        }
      } catch {}
    }}>
      <button type="submit" className={`px-2 py-0.5 rounded border text-xs ${actionType === 'delete' ? 'border-red-300 text-red-700' : 'border-gray-300 text-gray-700'}`}>{label}</button>
    </form>
  );
}

async function VersionManager({ externalCourseId }: { externalCourseId: string }) {
  const h = headers();
  const c = cookies();
  const cookie = h.get('cookie') ?? c.getAll().map(x => `${x.name}=${x.value}`).join('; ');
  const testAuth = h.get('x-test-auth') ?? c.get('x-test-auth')?.value;
  const versions = await createRegistryGateway().listVersions(externalCourseId).catch(() => [] as any[]);
  return (
    <section className="border rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Versions</h2>
        <NewVersionForm externalCourseId={externalCourseId} />
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Version</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Launch URL</th>
            <th className="p-2 border w-48">Actions</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((v: any) => (
            <tr key={v.id} className="border-b">
              <td className="p-2 border">{v.version}</td>
              <td className="p-2 border">{v.status}</td>
              <td className="p-2 border truncate max-w-xs" title={v.launch_url || ''}>{v.launch_url || '-'}</td>
              <td className="p-2 border">
                <div className="flex items-center gap-2">
                  <VersionActionForm id={v.id} actionType="approve" />
                  <VersionActionForm id={v.id} actionType="disable" />
                  <VersionActionForm id={v.id} actionType="delete" />
                </div>
              </td>
            </tr>
          ))}
          {(!versions || versions.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={4}>No versions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

function VersionActionForm({ id, actionType }: { id: string; actionType: 'approve' | 'disable' | 'delete' }) {
  const label = actionType === 'approve' ? 'Approve' : actionType === 'disable' ? 'Disable' : 'Delete';
  return (
    <form action={async () => {
      'use server';
      if (process.env.EXTERNAL_COURSES !== '1') return;
      try {
        const { createRegistryGateway } = await import("@/lib/data/registry");
        if (actionType === 'delete') await createRegistryGateway().deleteVersion(id).catch(() => {});
        else await createRegistryGateway().updateVersion(id, { status: actionType === 'approve' ? 'approved' : 'disabled' }).catch(() => {});
      } catch {}
    }}>
      <button type="submit" className={`px-2 py-0.5 rounded border text-xs ${actionType === 'delete' ? 'border-red-300 text-red-700' : 'border-gray-300 text-gray-700'}`}>{label}</button>
    </form>
  );
}

function NewVersionForm({ externalCourseId }: { externalCourseId: string }) {
  return (
    <form action={async (formData: FormData) => {
      'use server';
      if (process.env.EXTERNAL_COURSES !== '1') return;
      const version = String(formData.get('version') || '');
      const status = String(formData.get('status') || 'approved');
      const launch_url = String(formData.get('launch_url') || '');
      const { createRegistryGateway } = await import("@/lib/data/registry");
      await createRegistryGateway().createVersion({ external_course_id: externalCourseId, version, status: status as any, launch_url: launch_url || null }).catch(() => {});
    }} className="flex items-center gap-2">
      <input name="version" className="border rounded px-2 py-1" placeholder="1.0.1" required />
      <select name="status" className="border rounded px-2 py-1" defaultValue="approved">
        <option value="draft">draft</option>
        <option value="approved">approved</option>
        <option value="disabled">disabled</option>
      </select>
      <input name="launch_url" className="border rounded px-2 py-1" placeholder="https://provider.example/launch" />
      <button type="submit" className="bg-black text-white rounded px-3 py-1">Add version</button>
    </form>
  );
}

async function QuickEditCourseForm({ id }: { id: string }) {
  const h = headers();
  const c = cookies();
  const cookie = h.get('cookie') ?? c.getAll().map(x => `${x.name}=${x.value}`).join('; ');
  const testAuth = h.get('x-test-auth') ?? c.get('x-test-auth')?.value;
  const row = await createRegistryGateway().getCourse(id).catch(() => null as any);
  return (
    <section className="border rounded p-4 space-y-3">
      <h2 className="font-medium">Quick edit</h2>
      <form action={async (formData: FormData) => {
        'use server';
        if (process.env.EXTERNAL_COURSES !== '1') return;
        const title = String(formData.get('title') || '');
        const description = String(formData.get('description') || '');
        const status = String(formData.get('status') || 'approved');
        const vendor_id = String(formData.get('vendor_id') || '');
        const { createRegistryGateway } = await import("@/lib/data/registry");
        await createRegistryGateway().updateCourse(id, { title, description, status: status as any, vendor_id: vendor_id || null }).catch(() => {});
      }} className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <input name="title" className="border rounded px-2 py-1 md:col-span-2" defaultValue={row?.title || ''} placeholder="Title" />
        <select name="status" className="border rounded px-2 py-1">
          <option value="draft" selected={row?.status === 'draft'}>draft</option>
          <option value="approved" selected={row?.status === 'approved'}>approved</option>
          <option value="disabled" selected={row?.status === 'disabled'}>disabled</option>
        </select>
        <input name="description" className="border rounded px-2 py-1 md:col-span-3" defaultValue={row?.description || ''} placeholder="Description" />
        <div className="md:col-span-6">
          <label className="block text-sm text-gray-600 mb-1">Vendor</label>
          <ProviderSelect defaultValue={row?.vendor_id || ''} />
        </div>
        <div className="md:col-span-6 flex items-center gap-3">
          <button className="bg-black text-white rounded px-3 py-1" type="submit">Save</button>
          <Link className="underline" href={{ pathname: '/dashboard/admin/catalog', query: {} as any }}>Close</Link>
        </div>
      </form>
    </section>
  );
}

async function ProviderManager() {
  const providers = await createProvidersGateway().list().catch(() => [] as any[]);
  return (
    <section className="border rounded p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Providers</h2>
        <NewProviderForm />
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Domain</th>
            <th className="p-2 border">JWKS URL</th>
            <th className="p-2 border w-48">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.domain}</td>
              <td className="p-2 border truncate max-w-xs" title={p.jwks_url}>{p.jwks_url}</td>
              <td className="p-2 border">
                <div className="flex items-center gap-2">
                  <EditProviderForm id={p.id} name={p.name} domain={p.domain} jwks_url={p.jwks_url} />
                  <DeleteProviderForm id={p.id} />
                </div>
              </td>
            </tr>
          ))}
          {(!providers || providers.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={4}>No providers</td>
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
      'use server';
      const name = String(formData.get('name') || '');
      const domain = String(formData.get('domain') || '');
      const jwks_url = String(formData.get('jwks_url') || '');
      const { createProvidersGateway } = await import("@/lib/data/providers");
      await createProvidersGateway().create({ name, domain, jwks_url }).catch(() => {});
    }} className="flex items-center gap-2">
      <input name="name" className="border rounded px-2 py-1" placeholder="Name" required />
      <input name="domain" className="border rounded px-2 py-1" placeholder="https://provider.example" required />
      <input name="jwks_url" className="border rounded px-2 py-1" placeholder="https://provider.example/jwks.json" required />
      <button type="submit" className="bg-black text-white rounded px-3 py-1">Add</button>
    </form>
  );
}

function EditProviderForm({ id, name, domain, jwks_url }: { id: string; name: string; domain: string; jwks_url: string }) {
  return (
    <form action={async (formData: FormData) => {
      'use server';
      const nextName = String(formData.get('name') || '');
      const nextDomain = String(formData.get('domain') || '');
      const nextJwks = String(formData.get('jwks_url') || '');
      const { createProvidersGateway } = await import("@/lib/data/providers");
      await createProvidersGateway().update(id, { name: nextName, domain: nextDomain, jwks_url: nextJwks }).catch(() => {});
    }} className="flex items-center gap-2">
      <input name="name" className="border rounded px-2 py-1 w-28" defaultValue={name} />
      <input name="domain" className="border rounded px-2 py-1 w-52" defaultValue={domain} />
      <input name="jwks_url" className="border rounded px-2 py-1 w-64" defaultValue={jwks_url} />
      <button type="submit" className="px-2 py-0.5 rounded border text-xs border-gray-300 text-gray-700">Save</button>
    </form>
  );
}

function DeleteProviderForm({ id }: { id: string }) {
  return (
    <form action={async () => {
      'use server';
      const { createProvidersGateway } = await import("@/lib/data/providers");
      await createProvidersGateway().remove(id).catch(() => {});
    }}>
      <button type="submit" className="px-2 py-0.5 rounded border text-xs border-red-300 text-red-700">Delete</button>
    </form>
  );
}

function NewExternalCourseForm() {
  return (
    <form action={async (formData: FormData) => {
      'use server';
      if (process.env.EXTERNAL_COURSES !== '1') return;
      const title = String(formData.get('title') || '');
      const kind = String(formData.get('kind') || 'v2');
      const version = String(formData.get('version') || '1.0.0');
      const status = String(formData.get('status') || 'approved');
      const launch_url = String(formData.get('launch_url') || '');
      const description = String(formData.get('description') || '');
      const { createRegistryGateway } = await import("@/lib/data/registry");
      await createRegistryGateway().createCourse({ title, kind: kind as any, version, status: status as any, description, launch_url: launch_url || null }).catch(() => {});
    }} className="border rounded p-4 space-y-2">
      <div className="font-medium">Add external course</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="title" className="border rounded px-2 py-1" placeholder="Title" required />
        <select name="kind" className="border rounded px-2 py-1" defaultValue="v2">
          <option value="v2">v2 (external URL)</option>
          <option value="v1">v1 (bundle)</option>
        </select>
        <input name="version" className="border rounded px-2 py-1" placeholder="1.0.0" defaultValue="1.0.0" />
        <input name="launch_url" className="border rounded px-2 py-1 md:col-span-2" placeholder="https://provider.example/launch" />
        <select name="status" className="border rounded px-2 py-1" defaultValue="approved">
          <option value="draft">draft</option>
          <option value="approved">approved</option>
          <option value="disabled">disabled</option>
        </select>
        <input name="description" className="border rounded px-2 py-1 md:col-span-3" placeholder="Description (optional)" />
      </div>
      <button className="bg-black text-white rounded px-3 py-1" type="submit">Create</button>
    </form>
  );
}


