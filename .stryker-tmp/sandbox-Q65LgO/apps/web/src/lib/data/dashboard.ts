// @ts-nocheck
import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { dashboardResponse } from "@education/shared";

export type DashboardGateway = {
  get(): Promise<z.infer<typeof dashboardResponse>>;
  getDisplayNamesByIds(ids: string[]): Promise<Record<string, string>>;
  getCourseTitlesByIds(ids: string[]): Promise<Record<string, string>>;
};

function buildHttpGateway(): DashboardGateway {
  return {
    async get() {
      return fetchJson(`/api/dashboard`, dashboardResponse);
    },
    async getDisplayNamesByIds(ids: string[]) {
      if (!ids || ids.length === 0) return {};
      const unique = Array.from(new Set(ids));
      if (isTestMode()) {
        // Resolve via in-memory store
        const map: Record<string, string> = {};
        const { getTestProfile } = await import("@/lib/testStore");
        for (const id of unique) {
          const p = getTestProfile(id) as any;
          map[id] = p?.display_name || p?.email || id;
        }
        return map;
      }
      const { getServerComponentSupabase } = await import("@/lib/supabaseServer");
      const supabase = getServerComponentSupabase();
      const { data, error } = await supabase.from('profiles').select('id,display_name,email').in('id', unique);
      if (error) return {};
      const map: Record<string, string> = {};
      for (const r of (data || []) as any[]) map[r.id] = r.display_name || r.email || r.id;
      return map;
    },
    async getCourseTitlesByIds(ids: string[]) {
      if (!ids || ids.length === 0) return {};
      const unique = Array.from(new Set(ids));
      if (isTestMode()) {
        const { getTestCourse } = await import("@/lib/testStore");
        const map: Record<string, string> = {};
        for (const id of unique) {
          const c = getTestCourse(id) as any;
          if (c) map[id] = c.title;
        }
        return map;
      }
      const { getServerComponentSupabase } = await import("@/lib/supabaseServer");
      const supabase = getServerComponentSupabase();
      const { data, error } = await supabase.from('courses').select('id,title').in('id', unique);
      if (error) return {};
      const map: Record<string, string> = {};
      for (const r of (data || []) as any[]) map[r.id] = r.title;
      return map;
    }
  };
}

function buildTestGateway(): DashboardGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): DashboardGateway {
  return buildHttpGateway();
}

export function createTestGateway(): DashboardGateway {
  return buildTestGateway();
}

export function createDashboardGateway(): DashboardGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


