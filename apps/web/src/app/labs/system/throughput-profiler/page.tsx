import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

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

async function runBurst(size: number, extraHeaders: HeadersInit) {
  const tasks = Array.from({ length: size }, async () => {
    const start = Date.now();
    try { await createHealthGateway().get(); } catch {}
    return Date.now() - start;
  });
  const durations = await Promise.all(tasks);
  const sorted = [...durations].sort((a, b) => a - b);
  const basic = computeBasicStats(durations);
  const totalMs = durations.reduce((a, b) => a + b, 0);
  const rps = totalMs > 0 ? Math.round((size / (totalMs / 1000)) * 100) / 100 : 0;
  return {
    size,
    durations,
    min: basic.min,
    avg: basic.avg,
    max: basic.max,
    p50: percentileNearestRank(sorted, 50),
    p95: percentileNearestRank(sorted, 95),
    rps
  } as const;
}

export default async function ThroughputProfilerPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;
  const extraHeaders = { ...(cookie ? { cookie } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const sizes = [5, 10, 20, 40] as const;
  const b1 = await runBurst(sizes[0], extraHeaders);
  const b2 = await runBurst(sizes[1], extraHeaders);
  const b3 = await runBurst(sizes[2], extraHeaders);
  const b4 = await runBurst(sizes[3], extraHeaders);
  const bursts = [b1, b2, b3, b4];

  const chartData = { bursts: bursts.map(b => ({ size: b.size, durations: b.durations })) };
  const chartHref = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(chartData))}`;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Throughput profiler</h1>

      <div>Bursts: <span className="font-mono" data-testid="tp-overall-bursts">{String(bursts.length)}</span></div>
      <a className="underline" data-testid="tp-download-chart-json" href={chartHref} download="throughput-chart.json">Download chart JSON</a>

      {bursts.map(b => (
        <section key={b.size} className="border rounded p-4" data-testid={`tp-burst-card-${b.size}`}>
          <h2 className="font-medium mb-2">Burst {b.size}</h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-gray-500">Samples</div>
            <div className="font-mono" data-testid={`tp-burst-sample-count-${b.size}`}>{String(b.size)}</div>

            <div className="text-gray-500">RPS</div>
            <div className="font-mono" data-testid={`tp-burst-rps-${b.size}`}>{String(b.rps)}</div>

            <div className="text-gray-500">Min (ms)</div>
            <div className="font-mono" data-testid={`tp-burst-min-${b.size}`}>{String(b.min)}</div>

            <div className="text-gray-500">Avg (ms)</div>
            <div className="font-mono" data-testid={`tp-burst-avg-${b.size}`}>{String(b.avg)}</div>

            <div className="text-gray-500">Max (ms)</div>
            <div className="font-mono" data-testid={`tp-burst-max-${b.size}`}>{String(b.max)}</div>

            <div className="text-gray-500">p50 (ms)</div>
            <div className="font-mono" data-testid={`tp-burst-p50-${b.size}`}>{String(b.p50)}</div>

            <div className="text-gray-500">p95 (ms)</div>
            <div className="font-mono" data-testid={`tp-burst-p95-${b.size}`}>{String(b.p95)}</div>
          </div>
          <ul className="grid grid-cols-5 gap-2">
            {b.durations.map((d, i) => (
              <li key={i} className="font-mono text-xs" data-testid={`tp-item-${b.size}`}>{d}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}


