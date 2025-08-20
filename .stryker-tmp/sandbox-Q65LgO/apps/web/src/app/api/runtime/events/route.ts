// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { runtimeEvent } from "@education/shared";
import { getRequestLogger } from "@/lib/logger";
import { isInteractiveRuntimeEnabled } from "@/lib/testMode";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRequestOrigin, isOriginAllowedByEnv, buildCorsHeaders } from "@/lib/cors";

function isRuntimeV2Enabled() {
  return process.env.RUNTIME_API_V2 === '1';
}

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  // Runtime v2 bearer-auth path (primary when enabled)
  if (isRuntimeV2Enabled()) {
    const auth = req.headers.get('authorization') || '';
    const rt = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!rt) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Missing runtime token' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    let claims: any = null;
    try {
      const pub = process.env.NEXT_RUNTIME_PUBLIC_KEY || '';
      if (pub) {
        const jose = await import('jose');
        const key = await jose.importSPKI(pub, 'RS256');
        const { payload } = await jose.jwtVerify(rt, key, { algorithms: ['RS256'] });
        claims = payload;
      } else {
        if (process.env.NODE_ENV === 'production') throw new Error('NEXT_RUNTIME_PUBLIC_KEY required');
        const secret = new TextEncoder().encode(process.env.NEXT_RUNTIME_SECRET || 'dev-secret');
        const { payload } = await (await import('jose')).jwtVerify(rt, secret, { algorithms: ['HS256'] });
        claims = payload;
      }
    } catch {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Invalid runtime token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    }
    // Enforce audience binding when origin is present and allowed
    try {
      const reqOrigin = getRequestOrigin(req as any);
      if (reqOrigin && isOriginAllowedByEnv(reqOrigin)) {
        const aud = (claims as any)?.aud as string | undefined;
        if (!aud || aud !== reqOrigin) {
          return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Audience mismatch' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        }
      }
    } catch {}
    const body = await req.json().catch(() => ({}));
    const parsed = runtimeEvent.safeParse(body?.event ?? body);
    if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    const ev = parsed.data;
    const supabase = getRouteHandlerSupabase();
    // Scope enforcement from runtime token claims (scopes array)
    try {
      const scopes: string[] = Array.isArray((claims as any)?.scopes) ? (claims as any).scopes : [];
      const evType = (ev as any).type as string;
      if (evType === 'course.progress' && !scopes.includes('progress.write')) {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Missing scope progress.write' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
      }
      if (evType === 'course.attempt.completed' && !scopes.includes('attempts.write')) {
        return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Missing scope attempts.write' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
      }
    } catch {}
    // Rate limit per alias+course
    const alias = String((claims as any)?.alias || '');
    const courseId = String((claims as any)?.courseId || '');
    const rlKey = `evt:${courseId}:${alias || 'anon'}`;
    const rl = checkRateLimit(rlKey, Number(process.env.RUNTIME_EVENTS_LIMIT || 60), Number(process.env.RUNTIME_EVENTS_WINDOW_MS || 60000));
    if (!rl.allowed) {
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        {
          status: 429,
          headers: {
            'x-request-id': requestId,
            'retry-after': String(Math.ceil(retry / 1000)),
            'x-rate-limit-remaining': String(rl.remaining),
            'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000))
          }
        }
      );
    }
    // Persist minimal signals; ignore failures (RLS) as best-effort telemetry
    try {
      if (ev.type === 'course.attempt.completed') {
        await supabase.from('interactive_attempts').insert({ course_id: courseId, user_id: null, runtime_attempt_id: (ev as any).runtimeAttemptId ?? null, score: (ev as any).score, max: (ev as any).max, passed: (ev as any).passed });
      } else if (ev.type === 'course.progress') {
        await supabase.from('interactive_attempts').insert({ course_id: courseId, user_id: null, pct: Math.round((ev as any).pct), topic: (ev as any).topic ?? null });
      }
      await supabase.from('course_events').insert({ course_id: courseId, user_id: null, type: `runtime.${(ev as any).type}`, payload: ev as any, request_id: requestId });
    } catch {}
    const reqOrigin = getRequestOrigin(req as any);
    const allowCors = !!reqOrigin && isOriginAllowedByEnv(reqOrigin);
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (allowCors) Object.assign(headers, buildCorsHeaders(reqOrigin));
    return NextResponse.json({ ok: true }, { status: 201, headers });
  }

  // Fallback: legacy interactive runtime path (platform-auth, used when v2 disabled)
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const body = await req.json().catch(() => ({}));
  const { courseId, event, token } = body || {};
  if (!courseId) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'courseId required' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  if (!isInteractiveRuntimeEnabled()) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Interactive runtime disabled' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const rlKey = `evt:${courseId}:${user?.id ?? 'anon'}`;
  const rl = checkRateLimit(rlKey, Number(process.env.RUNTIME_EVENTS_LIMIT || 60), Number(process.env.RUNTIME_EVENTS_WINDOW_MS || 60000));
  if (!rl.allowed) {
    const retry = Math.max(0, rl.resetAt - Date.now());
    return NextResponse.json(
      { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
      {
        status: 429,
        headers: {
          'x-request-id': requestId,
          'retry-after': String(Math.ceil(retry / 1000)),
          'x-rate-limit-remaining': String(rl.remaining),
          'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000))
        }
      }
    );
  }
  const parsed = runtimeEvent.safeParse(event);
  if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const log = getRequestLogger(requestId);
  try {
    const { data: courseRow } = await supabase.from('courses').select('scopes').eq('id', courseId).single();
    const scopes: string[] = (courseRow as any)?.scopes ?? [];
    const evType = (parsed.data as any).type as string;
    if (evType === 'course.progress' && !scopes.includes('progress.write')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Missing scope progress.write' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    }
    if (evType === 'course.attempt.completed' && !scopes.includes('attempts.write')) {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Missing scope attempts.write' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    }
  } catch {}
  try {
    if (typeof token === 'string' && token.includes('.')) {
      const payload = token.split('.')[1];
      const raw = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as any;
      const nonce = raw?.nonce as string | undefined;
      const exp = raw?.exp ? new Date(raw.exp * 1000).toISOString() : undefined;
      if (nonce) {
        const { data: row } = await supabase.from('interactive_launch_tokens').select('nonce,used_at,exp').eq('nonce', nonce).single();
        if (!row) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Invalid token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        if ((row as any).used_at) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Token already used' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        const nowIso = new Date().toISOString();
        if ((row as any).exp && nowIso > (row as any).exp) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Token expired' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
        await supabase.from('interactive_launch_tokens').update({ used_at: new Date().toISOString() }).eq('nonce', nonce);
      }
    }
  } catch {}
  const ev = parsed.data;
  try { log.info({ courseId, type: ev.type }, 'runtime_event_received'); } catch {}
  let row: any = null;
  if (ev.type === 'course.attempt.completed') {
    const { data, error } = await supabase.from('interactive_attempts').insert({ course_id: courseId, user_id: user.id, runtime_attempt_id: (ev as any).runtimeAttemptId ?? null, score: (ev as any).score, max: (ev as any).max, passed: (ev as any).passed }).select().single();
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: (error as any).message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    row = data;
  } else if (ev.type === 'course.progress') {
    const { data, error } = await supabase.from('interactive_attempts').insert({ course_id: courseId, user_id: user.id, pct: Math.round((ev as any).pct), topic: (ev as any).topic ?? null }).select().single();
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: (error as any).message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    row = data;
  } else {
    row = { ok: true };
  }
  return NextResponse.json(row, { status: 201, headers: { 'x-request-id': requestId } });
});

export async function OPTIONS(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const origin = getRequestOrigin(req as any);
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (origin && isOriginAllowedByEnv(origin)) Object.assign(headers, buildCorsHeaders(origin));
  return new Response(null, { status: 204, headers });
}


