import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";

const exchangeResponse = z.object({ runtimeToken: z.string(), expiresAt: z.string() }).partial();

export type RuntimeGateway = {
  exchange(token: string): Promise<z.infer<typeof exchangeResponse>>;
  postEvent(input: { courseId: string; event: any; token?: string | null }): Promise<{ ok: true }>;
};

function buildHttpGateway(): RuntimeGateway {
  return {
    async exchange(token) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/runtime/auth/exchange`, exchangeResponse, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/runtime/auth/exchange`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }), cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return exchangeResponse.parse(json);
      }
    },
    async postEvent(input) {
      if (typeof window === 'undefined') {
        await fetchJson(`/api/runtime/events`, z.object({ ok: z.boolean() }).or(z.any()), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/runtime/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      return { ok: true } as const;
    }
  };
}

export function createRuntimeGateway(): RuntimeGateway { return buildHttpGateway(); }


