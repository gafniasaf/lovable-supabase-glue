import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type Flags = Record<string, boolean | number | string>;

export type FlagsGateway = {
  list(): Promise<Flags>;
  update(key: string, value: boolean | number | string): Promise<{ ok: true }>;
};

function buildHttpGateway(): FlagsGateway {
  return {
    async list() {
      return fetchJson(`/api/flags`, z.record(z.union([z.boolean(), z.number(), z.string()])));
    },
    async update(key, value) {
      await fetchJson(`/api/flags`, z.object({ ok: z.boolean() }), {
        method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, value })
      });
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): FlagsGateway { return buildHttpGateway(); }
export function createHttpGateway(): FlagsGateway { return buildHttpGateway(); }
export function createTestGateway(): FlagsGateway { return buildTestGateway(); }
export function createFlagsGateway(): FlagsGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


