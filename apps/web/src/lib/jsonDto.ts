import { NextResponse } from "next/server";
import type { z } from "zod";
import { getRequestLogger } from "@/lib/logger";

function redactIssues(issues: readonly { path: (string | number)[]; message: string }[]) {
  try {
    return issues.map(i => ({ path: i.path.join('.'), message: i.message }));
  } catch {
    return [] as any[];
  }
}

export function jsonDto<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
  opts: { requestId: string; status?: number } = { requestId: crypto.randomUUID(), status: 200 }
) {
  const { requestId } = opts;
  const status = typeof opts.status === 'number' ? opts.status : 200;
  const s: any = schema as any;
  // Allow callers to pass either a Zod schema or a plain object describing shape; if not Zod, bypass validation
  const parsed = typeof s?.safeParse === 'function'
    ? s.safeParse(data)
    : (typeof s?.parse === 'function' ? (() => { try { return { success: true, data: s.parse(data) }; } catch (e: any) { return { success: false, error: e }; } })() : { success: true, data });
  if (!parsed.success) {
    try { getRequestLogger(requestId).error({ issues: redactIssues(parsed.error.issues) }, 'dto_response_validation_failed'); } catch {}
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid response shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
  return NextResponse.json(parsed.data, { status, headers: { 'x-request-id': requestId } });
}


