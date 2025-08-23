import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ProviderRow = { id: string; name: string; domain: string | null; jwks_url: string | null };

const providerSchema = z.object({ id: z.string(), name: z.string(), domain: z.string().nullable(), jwks_url: z.string().nullable() });

export type ProvidersGateway = {
  list(): Promise<ProviderRow[]>;
  create(input: { name: string; jwks_url?: string; domain?: string }): Promise<ProviderRow>;
  update(id: string, input: { name?: string; jwks_url?: string; domain?: string }): Promise<ProviderRow>;
  remove(id: string): Promise<{ ok: true }>;
  health(id: string): Promise<{ ok: boolean } | any>;
  healthSummaries(): Promise<Record<string, { jwks_ok: boolean; domain_ok: boolean; checked_at: string }>>;
};

function buildHttpGateway(): ProvidersGateway {
  return {
    async list() {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/providers`, z.array(providerSchema));
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return z.array(providerSchema).parse(json);
      }
    },
    async create(input) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/providers`, providerSchema, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return providerSchema.parse(json);
      }
    },
    async update(id, input) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/providers?id=${encodeURIComponent(id)}`, providerSchema, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return providerSchema.parse(json);
      }
    },
    async remove(id) {
      if (typeof window === 'undefined') {
        await fetchJson(`/api/providers?id=${encodeURIComponent(id)}`, z.object({ ok: z.boolean() }), { method: 'DELETE' });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers?id=${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      return { ok: true } as const;
    },
    async health(id) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/providers/health?id=${encodeURIComponent(id)}`, z.any());
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers/health?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return json;
      }
    },
    async healthSummaries() {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/providers/health/summaries`, z.record(z.any()));
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/providers/health/summaries`, { cache: 'no-store' });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return json as any;
      }
    }
  };
}

function buildTestGateway(): ProvidersGateway { return buildHttpGateway(); }
export function createHttpGateway(): ProvidersGateway { return buildHttpGateway(); }
export function createTestGateway(): ProvidersGateway { return buildTestGateway(); }
export function createProvidersGateway(): ProvidersGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


