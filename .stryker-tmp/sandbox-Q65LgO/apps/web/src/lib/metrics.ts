/**
 * Minimal in-memory metrics collector for p50/p95 route timings and error counts.
 * Intended for local/dev visibility. For production, wire to a metrics backend.
 */
// @ts-nocheck

type Sample = number;
type RouteKey = string;

const timings = new Map<RouteKey, Sample[]>();
const errors = new Map<RouteKey, number>();
const counters = new Map<string, number>();
const inFlight = new Map<RouteKey, number>();

export function recordTiming(routeKey: RouteKey, ms: number) {
  const arr = timings.get(routeKey) ?? [];
  arr.push(ms);
  if (arr.length > 1000) arr.shift();
  timings.set(routeKey, arr);
}

export function recordError(routeKey: RouteKey) {
  errors.set(routeKey, (errors.get(routeKey) ?? 0) + 1);
}

export function incrInFlight(routeKey: RouteKey) {
  inFlight.set(routeKey, (inFlight.get(routeKey) ?? 0) + 1);
}

export function decrInFlight(routeKey: RouteKey) {
  const cur = (inFlight.get(routeKey) ?? 0) - 1;
  inFlight.set(routeKey, Math.max(0, cur));
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx] ?? sorted[sorted.length - 1] ?? 0;
}

export function snapshot() {
  const out: Record<string, any> = {};
  for (const [k, arr] of timings.entries()) {
    out[k] = {
      count: arr.length,
      p50: percentile(arr, 50),
      p95: percentile(arr, 95),
      p99: percentile(arr, 99),
      errors: errors.get(k) ?? 0,
      in_flight: inFlight.get(k) ?? 0
    };
  }
  return out;
}

export function incrCounter(name: string, by: number = 1) {
  counters.set(name, (counters.get(name) ?? 0) + by);
}

export function getCounters() {
  return Object.fromEntries(counters.entries());
}


