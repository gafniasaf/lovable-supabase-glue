import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ParentLinkRow = { id: string; parent_id: string; student_id: string; created_at: string };

const parentLinkSchema = z.object({ id: z.string(), parent_id: z.string(), student_id: z.string(), created_at: z.string() });

export type ParentLinksGateway = {
  listByParent(parent_id: string): Promise<ParentLinkRow[]>;
  create(input: { parent_id: string; student_id: string }): Promise<ParentLinkRow>;
  remove(input: { parent_id: string; student_id: string }): Promise<{ ok: true }>;
  /** Back-compat alias for remove() used by some pages */
  'delete'(input: { parent_id: string; student_id: string }): Promise<{ ok: true }>;
};

function buildHttpGateway(): ParentLinksGateway {
  return {
    async listByParent(parent_id) {
      if (isTestMode()) {
        try {
          const { listTestParentChildren } = await import('@/lib/testStore');
          const seeded = (listTestParentChildren as any)(parent_id) as ParentLinkRow[];
          if (Array.isArray(seeded) && seeded.length > 0) return seeded as any;
        } catch {}
        const now = new Date().toISOString();
        return [
          { id: 'pl-1', parent_id, student_id: 's-1', created_at: now },
          { id: 'pl-2', parent_id, student_id: 's-2', created_at: now }
        ];
      }
      return fetchJson(`/api/parent-links?parent_id=${encodeURIComponent(parent_id)}`, z.array(parentLinkSchema));
    },
    async create(input) {
      if (isTestMode()) {
        return { id: `pl-${Math.random().toString(16).slice(2)}`, parent_id: input.parent_id, student_id: input.student_id, created_at: new Date().toISOString() } as ParentLinkRow;
      }
      return fetchJson(`/api/parent-links`, parentLinkSchema, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    },
    async remove(input) {
      if (isTestMode()) { return { ok: true } as const; }
      await fetchJson(`/api/parent-links`, z.object({ ok: z.boolean() }), { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }); return { ok: true } as const;
    },
    async ['delete'](input) { // alias for remove
      if (isTestMode()) { return { ok: true } as const; }
      await fetchJson(`/api/parent-links`, z.object({ ok: z.boolean() }), { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }); return { ok: true } as const;
    },
  };
}

function buildTestGateway(): ParentLinksGateway { return buildHttpGateway(); }
export function createHttpGateway(): ParentLinksGateway { return buildHttpGateway(); }
export function createTestGateway(): ParentLinksGateway { return buildTestGateway(); }
export function createParentLinksGateway(): ParentLinksGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


