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
      return fetchJson(`/api/enrollments`, z.array(enrollment));
    },
    async createLaunchToken(enrollmentId) {
      if (typeof window === 'undefined') {
        return fetchJson(`/api/enrollments/${encodeURIComponent(enrollmentId)}/launch-token`, launchTokenResponse, { method: 'POST' });
      } else {
        const base = process.env.NEXT_PUBLIC_BASE_URL || '';
        const res = await fetch(`${base}/api/enrollments/${encodeURIComponent(enrollmentId)}/launch-token`, { method: 'POST', cache: 'no-store' });
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



