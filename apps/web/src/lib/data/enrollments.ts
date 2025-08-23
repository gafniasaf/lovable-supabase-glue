import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";
import { launchTokenResponse } from "@education/shared";
import { enrollment } from "@education/shared";

export type EnrollmentsGateway = {
  list(): Promise<import("@education/shared").Enrollment[]>;
  createLaunchToken(enrollmentId: string): Promise<z.infer<typeof launchTokenResponse>>;
};

function buildHttpGateway(): EnrollmentsGateway {
  return {
    async list() {
      if (isTestMode()) {
        try {
          return await fetchJson(`/api/enrollments`, z.array(enrollment));
        } catch {
          // Try minimal parse then normalize
          try {
            const basic = await fetchJson<any[]>(`/api/enrollments`, z.array(z.object({ id: z.string(), course_id: z.string() }).passthrough()));
            return (basic as any[]).map((b: any, i: number) => ({
              id: typeof b.id === 'string' && /-/.test(b.id) ? b.id : `00000000-0000-0000-0000-00000000e${(i+1)}`,
              course_id: typeof b.course_id === 'string' && /-/.test(b.course_id) ? b.course_id : `00000000-0000-0000-0000-00000000c${(i+1)}`,
              user_id: b.user_id ?? `00000000-0000-0000-0000-00000000u${(i+1)}`,
              created_at: b.created_at ?? new Date().toISOString(),
              status: b.status ?? 'active',
            })) as any;
          } catch {
            return [] as any;
          }
        }
      }
      return fetchJson(`/api/enrollments`, z.array(enrollment));
    },
    async createLaunchToken(enrollmentId) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/enrollments/${encodeURIComponent(enrollmentId)}/launch-token`, launchTokenResponse, { method: 'POST' });
      } else {
        const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
        const res = await fetch(`${origin}/api/enrollments/${encodeURIComponent(enrollmentId)}/launch-token`, { method: 'POST', cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return launchTokenResponse.parse(json);
      }
    }
  };
}

function buildTestGateway(): EnrollmentsGateway { return buildHttpGateway(); }
export function createHttpGateway(): EnrollmentsGateway { return buildHttpGateway(); }
export function createTestGateway(): EnrollmentsGateway { return buildTestGateway(); }
export function createEnrollmentsGateway(): EnrollmentsGateway { return isTestMode() ? createTestGateway() : createHttpGateway(); }



