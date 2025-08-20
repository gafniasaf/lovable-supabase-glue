import type { APIRequestContext } from '@playwright/test';

export async function resetWithRetry(request: APIRequestContext, maxAttempts = 60, delayMs = 500) {
  // Ensure server is responsive first
  try { await request.get('/api/health'); } catch {}
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const ns = process.env.DEV_ID ? `?namespace=${encodeURIComponent(process.env.DEV_ID)}` : '';
      let resp = await request.post(`/api/test/reset${ns}`);
      if (resp.status() === 404) {
        resp = await request.post(`/api/__test__/reset${ns}`);
      }
      if (resp.ok()) {
        // Some dev overlays return ok() but HTML; ensure JSON ok: true
        try {
          const j = await resp.json();
          if (j && j.ok === true) return true;
        } catch {}
      }
    } catch {}
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}

export async function prewarmRoutes(request: APIRequestContext, paths: string[], headers?: Record<string, string>) {
  for (const p of paths) {
    try { await request.get(p, headers ? { headers } : undefined); } catch {}
  }
}

export async function waitForOk(
  request: APIRequestContext,
  path: string,
  headers?: Record<string, string>,
  timeoutMs = 60000,
  delayMs = 300
) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const resp = await request.get(path, headers ? { headers } : undefined);
      if (resp.ok()) return true;
    } catch {}
    await new Promise(r => setTimeout(r, delayMs));
  }
  return false;
}


