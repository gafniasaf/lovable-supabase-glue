// @ts-nocheck
import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

function computeBasicStats(values: number[]) {
  if (values.length === 0) return { min: 0, avg: 0, max: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return { min, avg, max };
}

function percentileNearestRank(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const n = sortedAsc.length;
  const rank = Math.ceil((p / 100) * n);
  const idx = Math.min(Math.max(rank, 1), n) - 1;
  return sortedAsc[idx];
}

export default async function ObserverPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;
  const extraHeaders = { ...(cookie ? { cookie } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const count = 20;
  const tasks = Array.from({ length: count }, async () => {
    const start = Date.now();
    const res = await serverFetch("/api/health", { headers: extraHeaders, cache: "no-store" });
    await res.text();
    return Date.now() - start;
  });
  const durations = await Promise.all(tasks);
  const stats = computeBasicStats(durations);
  const sorted = [...durations].sort((a, b) => a - b);
  const p50 = percentileNearestRank(sorted, 50);
  const p95 = percentileNearestRank(sorted, 95);
  const p99 = percentileNearestRank(sorted, 99);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">System observer</h1>
      <section className="border rounded p-4 inline-block min-w-[280px]">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Samples</div>
          <div className="font-mono" data-testid="observer-sample-count">{String(durations.length)}</div>

          <div className="text-gray-500">Min (ms)</div>
          <div className="font-mono" data-testid="observer-min">{String(stats.min)}</div>

          <div className="text-gray-500">Avg (ms)</div>
          <div className="font-mono" data-testid="observer-avg">{String(stats.avg)}</div>

          <div className="text-gray-500">Max (ms)</div>
          <div className="font-mono" data-testid="observer-max">{String(stats.max)}</div>

          <div className="text-gray-500">p50 (ms)</div>
          <div className="font-mono" data-testid="observer-p50">{String(p50)}</div>

          <div className="text-gray-500">p95 (ms)</div>
          <div className="font-mono" data-testid="observer-p95">{String(p95)}</div>

          <div className="text-gray-500">p99 (ms)</div>
          <div className="font-mono" data-testid="observer-p99">{String(p99)}</div>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Durations (ms)</h2>
        <ul className="space-y-1">
          {durations.map((d, i) => (
            <li key={i} className="font-mono text-sm" data-testid="observer-item">{d}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


