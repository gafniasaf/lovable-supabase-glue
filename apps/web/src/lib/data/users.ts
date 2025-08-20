import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type UsersGateway = {
  updateRole(input: { userId: string; role: 'student' | 'teacher' | 'parent' | 'admin' }): Promise<{ ok: true }>;
};

const okSchema = z.object({ ok: z.boolean() });

function buildHttpGateway(): UsersGateway {
  return {
    async updateRole(input) {
      await fetchJson(`/api/user/role`, okSchema, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input)
      });
      return { ok: true } as const;
    }
  };
}

function buildTestGateway(): UsersGateway { return buildHttpGateway(); }
export function createHttpGateway(): UsersGateway { return buildHttpGateway(); }
export function createTestGateway(): UsersGateway { return buildTestGateway(); }
export function createUsersGateway(): UsersGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }


