#!/usr/bin/env node

async function main() {
  const base = process.env.BASE_URL || 'http://localhost:3022';
  const token = process.env.METRICS_TOKEN || '';
  const budgetMs = Number(process.env.ALERT_P95_BUDGET_MS || 1200);
  const res = await fetch(`${base}/api/internal/metrics`, { headers: { accept: 'text/plain', 'x-metrics-token': token } });
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const p95 = {};
  const errors = {};
  for (const l of lines) {
    const m = l.match(/^app_route_timing_p95_ms\{route="([^"]+)"\} (\d+(?:\.\d+)?)$/);
    if (m) p95[m[1]] = Number(m[2]);
    const e = l.match(/^app_route_errors_total\{route="([^"]+)"\} (\d+)/);
    if (e) errors[e[1]] = Number(e[2]);
  }
  const offenders = Object.entries(p95).filter(([,v]) => v > budgetMs).sort((a,b) => b[1]-a[1]);
  const errorOffenders = Object.entries(errors).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);
  if (offenders.length) {
    const msg = [`${offenders.length} routes over p95 budget ${budgetMs}ms`, ...offenders.slice(0,10).map(([r,m]) => `${r}: ${m}ms`)].join('\n');
    console.error('ALERT:', msg);
    const slack = process.env.SLACK_WEBHOOK_URL || '';
    if (slack) {
      try { await fetch(slack, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `Metrics alert:\n${msg}` }) }); } catch {}
    }
    process.exitCode = 2;
  } else if (errorOffenders.length) {
    const msg = [`${errorOffenders.length} routes reporting errors`, ...errorOffenders.slice(0,10).map(([r,c]) => `${r}: ${c}`)].join('\n');
    console.error('ALERT:', msg);
    const slack = process.env.SLACK_WEBHOOK_URL || '';
    if (slack) {
      try { await fetch(slack, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: `Error alert:\n${msg}` }) }); } catch {}
    }
    process.exitCode = 2;
  } else {
    console.log('OK: all routes within p95 budget and no errors');
  }
}

main().catch(e => { console.error(e); process.exit(1); });


