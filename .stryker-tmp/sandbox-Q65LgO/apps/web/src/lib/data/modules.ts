// @ts-nocheck
import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ModuleRow = { id: string; course_id: string; title: string; order_index: number; created_at: string };

export type ModulesGateway = {
  listByCourse(courseId: string): Promise<ModuleRow[]>;
  create(input: { course_id: string; title: string; order_index?: number }): Promise<ModuleRow>;
  update(id: string, data: { title?: string; order_index?: number }): Promise<ModuleRow>;
  delete(id: string): Promise<{ ok: true }>;
};

const moduleSchema = z.object({ id: z.string(), course_id: z.string(), title: z.string(), order_index: z.number().int(), created_at: z.string() });

function buildHttpGateway(): ModulesGateway {
  return {
    async listByCourse(courseId) {
      return fetchJson(`/api/modules?course_id=${encodeURIComponent(courseId)}`, z.array(moduleSchema));
    },
    async create(input) {
      return fetchJson(`/api/modules`, moduleSchema, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
    },
    async update(id, data) {
      return fetchJson(`/api/modules?id=${encodeURIComponent(id)}`, moduleSchema, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
    },
    async delete(id) {
      await fetchJson(`/api/modules?id=${encodeURIComponent(id)}`, z.object({ ok: z.boolean() }), { method: 'DELETE' });
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): ModulesGateway { return buildHttpGateway(); }
export function createHttpGateway(): ModulesGateway { return buildHttpGateway(); }
export function createTestGateway(): ModulesGateway { return buildTestGateway(); }
export function createModulesGateway(): ModulesGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


