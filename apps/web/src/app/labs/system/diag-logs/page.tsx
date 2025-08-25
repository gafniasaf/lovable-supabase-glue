"use client";
import React from "react";

function useQueryString() {
  const [state, setState] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    try {
      const u = new URL(window.location.href);
      const next: Record<string, string> = {};
      u.searchParams.forEach((v, k) => { next[k] = v; });
      setState(next);
    } catch {}
  }, []);
  return state;
}

export default function Page() {
  const [items, setItems] = React.useState<any[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [n, setN] = React.useState(20);
  const [levels, setLevels] = React.useState("all");
  const [sinceMs, setSinceMs] = React.useState(300000);
  const [traceId, setTraceId] = React.useState("");
  const [stack, setStack] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const qs = useQueryString();

  React.useEffect(() => {
    const l = String(qs["levels"] || "");
    if (l) setLevels(l);
    const s = Number(qs["sinceMs"] || 0);
    if (s > 0) setSinceMs(s);
    const t = String(qs["traceId"] || "");
    if (t) setTraceId(t);
  }, [qs]);

  async function load(nextOffset = 0) {
    const params = new URLSearchParams();
    params.set("n", String(n));
    params.set("offset", String(nextOffset));
    params.set("levels", levels);
    if (sinceMs > 0) params.set("sinceMs", String(sinceMs));
    if (traceId) params.set("traceId", traceId);
    if (stack) params.set("stack", "1");
    const res = await fetch(`/api/diag/errors?${params.toString()}`, { headers: { "x-admin-diag": "1" } } as any);
    const body = await res.json();
    setItems(body.items || []);
    setOffset(body.page?.offset || 0);
    setHasMore(!!body.page?.hasMore);
  }

  async function clearLogs() {
    await fetch(`/api/diag/errors?clear=1`, { method: "POST", headers: { "x-admin-diag": "1" } } as any);
    setItems([]);
    setOffset(0);
    setHasMore(false);
  }

  React.useEffect(() => { load(0); /* initial */ }, [levels, sinceMs, traceId, n, stack, load]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Diagnostics: Server Logs</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, alignItems: 'end', marginBottom: 12 }}>
        <div>
          <label htmlFor="diag-levels">Levels</label>
          <input id="diag-levels" value={levels} onChange={e => setLevels(e.target.value)} placeholder="all or comma list" />
        </div>
        <div>
          <label htmlFor="diag-since">Since (ms)</label>
          <input id="diag-since" type="number" value={sinceMs} onChange={e => setSinceMs(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="diag-trace">TraceId</label>
          <input id="diag-trace" value={traceId} onChange={e => setTraceId(e.target.value)} placeholder="request id" />
        </div>
        <div>
          <label htmlFor="diag-limit">Limit</label>
          <input id="diag-limit" type="number" value={n} onChange={e => setN(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor="diag-stack">Include Stack</label>
          <input id="diag-stack" type="checkbox" checked={stack} onChange={e => setStack(e.target.checked)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => load(0)}>Apply</button>
          <button onClick={() => clearLogs()}>Clear</button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>Offset: {offset}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={offset === 0} onClick={() => load(Math.max(0, offset - n))}>Prev</button>
          <button disabled={!hasMore} onClick={() => load(offset + n)}>Next</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>ts</th>
            <th style={{ textAlign: 'left' }}>level</th>
            <th style={{ textAlign: 'left' }}>requestId</th>
            <th style={{ textAlign: 'left' }}>path</th>
            <th style={{ textAlign: 'left' }}>msg</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>{it.ts ? new Date(it.ts).toISOString() : ''}</td>
              <td>{it.level}</td>
              <td>{it.requestId}</td>
              <td>{it.path}</td>
              <td>
                <div style={{ whiteSpace: 'pre-wrap' }}>{it.msg}</div>
                {it.errStack ? <details><summary>stack</summary><pre>{it.errStack}</pre></details> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


