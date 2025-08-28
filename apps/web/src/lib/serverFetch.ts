export async function serverFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = `${base}${path}`;
  try {
    return await fetch(url, { cache: 'no-store', ...(init || {}) });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
}
