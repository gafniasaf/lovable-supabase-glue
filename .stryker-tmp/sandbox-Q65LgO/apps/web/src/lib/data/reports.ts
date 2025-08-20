// @ts-nocheck
import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type ReportsGateway = {
  engagement(course_id: string): Promise<{ lessons: number; assignments: number; submissions: number }>;
  gradeDistribution(course_id: string): Promise<{ total: number; average: number; dist: { bucket: string; count: number }[] }>;
};

function buildHttpGateway(): ReportsGateway {
  return {
    async engagement(course_id) {
      const schema = z.object({ lessons: z.number(), assignments: z.number(), submissions: z.number() });
      return fetchJson(`/api/reports/engagement?course_id=${encodeURIComponent(course_id)}`, schema);
    },
    async gradeDistribution(course_id) {
      const schema = z.object({ total: z.number(), average: z.number(), dist: z.array(z.object({ bucket: z.string(), count: z.number() })) });
      return fetchJson(`/api/reports/grade-distribution?course_id=${encodeURIComponent(course_id)}`, schema);
    }
  };
}

function buildTestGateway(): ReportsGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): ReportsGateway {
  return buildHttpGateway();
}

export function createTestGateway(): ReportsGateway {
  return buildTestGateway();
}

export function createReportsGateway(): ReportsGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}


