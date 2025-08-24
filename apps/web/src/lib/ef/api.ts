export async function efSubmitAssessment(input: { programId: string; epaId: string; body?: string }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Idempotency-Key': (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) };
  const res = await fetch('/api/ef/assessments', { method: 'POST', headers, body: JSON.stringify(input) } as any);
  if (res.status === 429) throw new Error(`RATE_LIMIT ${res.headers.get('retry-after') ?? ''}`);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return { data: json, requestId: res.headers.get('x-request-id') || undefined };
}

export async function efCreateEvaluation(input: { assessmentId: string; outcome: 'approved'|'rejected'|'needs_changes'; comments?: string }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'Idempotency-Key': (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) };
  const res = await fetch('/api/ef/evaluations', { method: 'POST', headers, body: JSON.stringify(input) } as any);
  if (res.status === 429) throw new Error(`RATE_LIMIT ${res.headers.get('retry-after') ?? ''}`);
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return { data: json, requestId: res.headers.get('x-request-id') || undefined };
}

export async function efReadTrainee(input: { traineeId: string; programId: string }) {
  const res = await fetch('/api/ef/read/trainee', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) } as any);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function efReadSupervisor(input: { supervisorId: string }) {
  const res = await fetch('/api/ef/read/supervisor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) } as any);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function efReadProgram(input: { programId: string }) {
  const res = await fetch('/api/ef/read/program', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) } as any);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


