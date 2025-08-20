import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default async function AdminMetricsPage() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const res = await fetch(`${base}/api/admin/metrics`, { cache: 'no-store', headers: { 'accept': 'application/json' } });
  const json = await res.json().catch(() => ({ timings: {}, counters: {} } as any));
  const timings = json?.timings || {};
  const counters = json?.counters || {};
  return (
    <section className="p-6 space-y-4" aria-label="Admin metrics">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Metrics" }]} />
      <h1 className="text-xl font-semibold">Metrics</h1>
      <div className="text-sm">
        <Link className="underline" href="/api/admin/metrics" prefetch={false}>JSON</Link>
        <span className="mx-2">·</span>
        <Link className="underline" href="/api/admin/metrics" prefetch={false} target="_blank">Text (Prometheus)</Link>
      </div>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Route timings</h2>
        <table className="w-full text-sm border">
          <thead><tr className="bg-gray-50 text-left"><th className="p-2 border">Route</th><th className="p-2 border">Count</th><th className="p-2 border">p50</th><th className="p-2 border">p95</th><th className="p-2 border">p99</th><th className="p-2 border">Errors</th><th className="p-2 border">In-flight</th></tr></thead>
          <tbody>
            {Object.keys(timings).length === 0 ? (
              <tr><td className="p-2 text-gray-500" colSpan={7}>No data</td></tr>
            ) : (
              Object.entries(timings).map(([route, v]: any) => (
                <tr key={route} className="border-t"><td className="p-2 border font-mono text-xs">{route}</td><td className="p-2 border">{v.count}</td><td className="p-2 border">{v.p50}</td><td className="p-2 border">{v.p95}</td><td className="p-2 border">{v.p99}</td><td className="p-2 border">{v.errors}</td><td className="p-2 border">{v.in_flight}</td></tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Counters</h2>
        <table className="w-full text-sm border">
          <thead><tr className="bg-gray-50 text-left"><th className="p-2 border">Name</th><th className="p-2 border">Value</th></tr></thead>
          <tbody>
            {Object.keys(counters).length === 0 ? (
              <tr><td className="p-2 text-gray-500" colSpan={2}>No data</td></tr>
            ) : (
              Object.entries(counters).map(([k, v]: any) => (
                <tr key={k} className="border-t"><td className="p-2 border font-mono text-xs">{k}</td><td className="p-2 border">{v}</td></tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </section>
  );
}


