"use client";
import { useEffect, useState } from "react";
import { createCoursesGateway } from "@/lib/data/courses";
import { createProvidersGateway } from "@/lib/data/providers";
import { useForm } from "react-hook-form";
import Trans from "@/lib/i18n/Trans";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseCreateRequest, scope } from "@education/shared";
import { z } from "zod";

export default function NewCoursePage() {
  const formSchema = courseCreateRequest.extend({
    // Accept empty string in form fields for optional values
    launch_kind: z.union([z.literal(''), z.enum(['WebEmbed','RemoteContainer','StreamedDesktop'])]).optional().nullable(),
    launch_url: z.union([z.literal(''), z.string().url()]).optional().nullable(),
    provider_id: z.union([z.literal(''), z.string().uuid()]).optional().nullable(),
    scopes: z.array(scope).optional().nullable()
  });
  const form = useForm<{ title: string; description?: string | null; launch_kind?: 'WebEmbed' | 'RemoteContainer' | 'StreamedDesktop' | '' | null; launch_url?: string | null; provider_id?: string | null; scopes?: typeof scope._type[] | null}>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", launch_kind: "", launch_url: "", provider_id: "", scopes: [] }
  });
  const [providers, setProviders] = useState<any[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: any) => {
    setLoading(true);
    setErr(null);
    setOk(false);
    const res = await (async () => {
      try {
        // Normalize optional fields: convert empty string to undefined to satisfy server schema
        const normalized = {
          ...values,
          launch_kind: values.launch_kind ? values.launch_kind : undefined,
          launch_url: values.launch_url ? values.launch_url : undefined,
          provider_id: values.provider_id ? values.provider_id : undefined,
          ...(scopes.length ? { scopes } : {})
        } as any;
        const created = await createCoursesGateway().create(normalized);
        return { ok: true, json: async () => created } as any;
      } catch (e: any) {
        return { ok: false, status: 400, json: async () => ({ error: { message: String(e?.message || e) } }) } as any;
      }
    })();
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j?.error?.message ?? `Error ${res.status}`);
      return;
    }
    setOk(true);
    form.reset();
    setScopes([]);
  };

  useEffect(() => {
    (async () => {
      try {
        const rows = await createProvidersGateway().list();
        setProviders(rows);
      } catch {}
    })();
  }, []);

  return (
    <section className="p-6 max-w-lg" aria-label="New course">
      <h1 className="text-xl font-semibold"><Trans keyPath="teacher.newCourse.title" fallback="Create course" /></h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-3">
        {err && <p className="text-red-600 text-sm">{err}</p>}
        {ok && <p className="text-green-600 text-sm"><Trans keyPath="teacher.newCourse.created" fallback="Created!" /></p>}
        <div>
          <label htmlFor="course-title" className="block text-sm text-gray-600 mb-1"><Trans keyPath="teacher.newCourse.titleLabel" fallback="Title" /></label>
          <input id="course-title" className="w-full border rounded px-3 py-2" placeholder="Title" {...form.register("title")} />
        </div>
        <div>
          <label htmlFor="course-description" className="block text-sm text-gray-600 mb-1"><Trans keyPath="teacher.newCourse.descriptionLabel" fallback="Description" /></label>
          <textarea id="course-description" className="w-full border rounded px-3 py-2" placeholder="Description" {...form.register("description")} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="course-launch-kind" className="block text-sm text-gray-600 mb-1"><Trans keyPath="teacher.newCourse.launchKind" fallback="Launch kind (optional)" /></label>
            <select id="course-launch-kind" className="w-full border rounded px-3 py-2" {...form.register("launch_kind")}>
              <option value="">None (standard)</option>
              <option value="WebEmbed">WebEmbed (iframe)</option>
              <option value="RemoteContainer" disabled>RemoteContainer (future)</option>
              <option value="StreamedDesktop" disabled>StreamedDesktop (future)</option>
            </select>
          </div>
          <div>
            <label htmlFor="course-launch-url" className="block text-sm text-gray-600 mb-1"><Trans keyPath="teacher.newCourse.launchUrl" fallback="Launch URL (optional)" /></label>
            <input id="course-launch-url" className="w-full border rounded px-3 py-2" placeholder="https://provider.example/launch" {...form.register("launch_url")} />
          </div>
          <div>
            <label htmlFor="course-provider" className="block text-sm text-gray-600 mb-1"><Trans keyPath="teacher.newCourse.provider" fallback="Provider (optional)" /></label>
            <select id="course-provider" className="w-full border rounded px-3 py-2" {...form.register("provider_id")}>
              <option value="">None</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div className="block text-sm text-gray-600 mb-1" id="course-scopes-label"><Trans keyPath="teacher.newCourse.scopes" fallback="Scopes (optional)" /></div>
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              { key: 'progress.write', label: 'progress.write' },
              { key: 'progress.read', label: 'progress.read' },
              { key: 'attempts.write', label: 'attempts.write' },
              { key: 'attempts.read', label: 'attempts.read' },
              { key: 'files.read', label: 'files.read' },
              { key: 'files.write', label: 'files.write' },
            ].map(opt => (
              <label key={opt.key} className="inline-flex items-center gap-2" aria-labelledby="course-scopes-label">
                <input aria-labelledby="course-scopes-label" type="checkbox" checked={scopes.includes(opt.key)} onChange={(e) => {
                  setScopes(prev => e.target.checked ? Array.from(new Set([...prev, opt.key])) : prev.filter(x => x !== opt.key));
                }} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="bg-black text-white rounded px-4 py-2 disabled:opacity-50" disabled={loading}>{loading ? "Creating..." : <Trans keyPath="common.create" fallback="Create" />}</button>
        {Object.values(form.formState.errors).length > 0 && (
          <div className="text-red-600 text-sm">
            {Object.values(form.formState.errors).map((e, i) => <div key={i}>{(e as any)?.message}</div>)}
          </div>
        )}
      </form>
    </section>
  );
}


