import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { profileResponse, profileUpdateRequest } from "@education/shared";

export type ProfilesGateway = {
  get(): Promise<z.infer<typeof profileResponse>>;
  update(input: z.infer<typeof profileUpdateRequest>): Promise<{ ok: true }>;
  getDisplayNamesByIds(ids: string[]): Promise<Record<string, string>>;
};

function buildHttpGateway(): ProfilesGateway {
  return {
    async get() {
      if (isTestMode()) {
        // Always attempt real endpoint; do not fabricate profile in tests so unauthenticated states are observable
        return await fetchJson(`/api/user/profile`, profileResponse);
      }
      return fetchJson(`/api/user/profile`, profileResponse);
    },
    async update(input) {
      await fetchJson(`/api/user/profile`, z.object({ ok: z.boolean() }), {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      });
      return { ok: true } as const;
    },
    async getDisplayNamesByIds(ids: string[]) {
      if (!ids || ids.length === 0) return {};
      const unique = Array.from(new Set(ids));
      if (typeof window !== 'undefined') {
        // Not expected to be called client-side for now
        return {};
      }
      const { getServerComponentSupabase } = await import("@/lib/supabaseServer");
      const supabase = getServerComponentSupabase();
      const { data, error } = await supabase
        .from('profiles')
        .select('id,display_name,email')
        .in('id', unique);
      if (error) return {};
      const map: Record<string, string> = {};
      for (const r of (data || []) as any[]) {
        map[r.id] = r.display_name || r.email || r.id;
      }
      return map;
    }
  };
}

function buildTestGateway(): ProfilesGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): ProfilesGateway {
  return buildHttpGateway();
}

export function createTestGateway(): ProfilesGateway {
  return buildTestGateway();
}

export function createProfilesGateway(): ProfilesGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


