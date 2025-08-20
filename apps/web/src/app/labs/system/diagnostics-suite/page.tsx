import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

type Stats = {
  sampleCount: number;
  minMs: number;
  avgMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
  durationsMs: number[];
};

function computeBasicStats(values: number[]): { min: number; avg: number; max: number } {
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

async function runBatch(sampleSize: number, extraHeaders: HeadersInit): Promise<Stats> {
  const tasks = Array.from({ length: sampleSize }, async () => {
    const start = Date.now();
    try { await createHealthGateway().get(); } catch {}
    return Date.now() - start;
  });
  const durations = await Promise.all(tasks);
  const sorted = [...durations].sort((a, b) => a - b);
  const basic = computeBasicStats(durations);
  return {
    sampleCount: durations.length,
    minMs: basic.min,
    avgMs: basic.avg,
    maxMs: basic.max,
    p50Ms: percentileNearestRank(sorted, 50),
    p95Ms: percentileNearestRank(sorted, 95),
    durationsMs: durations
  };
}

export default async function DiagnosticsSuitePage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;
  const extraHeaders = { ...(cookie ? { cookie } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const sizes = [10, 20, 30] as const;
  const batch10 = await runBatch(sizes[0], extraHeaders);
  const batch20 = await runBatch(sizes[1], extraHeaders);
  const batch30 = await runBatch(sizes[2], extraHeaders);

  const overallDurations = [...batch10.durationsMs, ...batch20.durationsMs, ...batch30.durationsMs];
  const overallSorted = [...overallDurations].sort((a, b) => a - b);
  const overallBasic = computeBasicStats(overallDurations);
  const overall = {
    sampleCount: overallDurations.length,
    minMs: overallBasic.min,
    avgMs: overallBasic.avg,
    maxMs: overallBasic.max,
    p50Ms: percentileNearestRank(overallSorted, 50),
    p95Ms: percentileNearestRank(overallSorted, 95)
  };

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Diagnostics suite</h1>

      <BatchCard label="10" stats={batch10} />
      <BatchCard label="20" stats={batch20} />
      <BatchCard label="30" stats={batch30} />

      <section className="border rounded p-4 inline-block min-w-[300px]">
        <h2 className="font-medium mb-2">Overall</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Samples</div>
          <div className="font-mono" data-testid="diag-overall-sample-count">{String(overall.sampleCount)}</div>

          <div className="text-gray-500">Min (ms)</div>
          <div className="font-mono" data-testid="diag-overall-min">{String(overall.minMs)}</div>

          <div className="text-gray-500">Avg (ms)</div>
          <div className="font-mono" data-testid="diag-overall-avg">{String(overall.avgMs)}</div>

          <div className="text-gray-500">Max (ms)</div>
          <div className="font-mono" data-testid="diag-overall-max">{String(overall.maxMs)}</div>

          <div className="text-gray-500">p50 (ms)</div>
          <div className="font-mono" data-testid="diag-overall-p50">{String(overall.p50Ms)}</div>

          <div className="text-gray-500">p95 (ms)</div>
          <div className="font-mono" data-testid="diag-overall-p95">{String(overall.p95Ms)}</div>
        </div>
      </section>
    </main>
  );
}

function BatchCard({ label, stats }: { label: string; stats: Stats }) {
  return (
    <section className="border rounded p-4" data-testid={`diag-batch-card-${label}`}>
      <h2 className="font-medium mb-2">Batch {label}</h2>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-gray-500">Samples</div>
        <div className="font-mono" data-testid={`diag-batch-sample-count-${label}`}>{String(stats.sampleCount)}</div>

        <div className="text-gray-500">Min (ms)</div>
        <div className="font-mono" data-testid={`diag-batch-min-${label}`}>{String(stats.minMs)}</div>

        <div className="text-gray-500">Avg (ms)</div>
        <div className="font-mono" data-testid={`diag-batch-avg-${label}`}>{String(stats.avgMs)}</div>

        <div className="text-gray-500">Max (ms)</div>
        <div className="font-mono" data-testid={`diag-batch-max-${label}`}>{String(stats.maxMs)}</div>

        <div className="text-gray-500">p50 (ms)</div>
        <div className="font-mono" data-testid={`diag-batch-p50-${label}`}>{String(stats.p50Ms)}</div>

        <div className="text-gray-500">p95 (ms)</div>
        <div className="font-mono" data-testid={`diag-batch-p95-${label}`}>{String(stats.p95Ms)}</div>
      </div>
      <ul className="grid grid-cols-5 gap-2">
        {stats.durationsMs.map((d, i) => (
          <li key={i} className="font-mono text-xs" data-testid={`diag-item-${label}`}>{d}</li>
        ))}
      </ul>
    </section>
  );
}


