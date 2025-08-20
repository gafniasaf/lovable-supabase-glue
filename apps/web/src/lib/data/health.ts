import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type Health = { ok: boolean; ts: number; testMode?: boolean } & Record<string, any>;

export type HealthGateway = {
  get(): Promise<Health>;
};

function buildHttpGateway(): HealthGateway {
  return {
    async get() {
      return fetchJson(`/api/health`, z.any());
    }
  };
}

function buildTestGateway(): HealthGateway { return buildHttpGateway(); }
export function createHttpGateway(): HealthGateway { return buildHttpGateway(); }
export function createTestGateway(): HealthGateway { return buildTestGateway(); }
export function createHealthGateway(): HealthGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


