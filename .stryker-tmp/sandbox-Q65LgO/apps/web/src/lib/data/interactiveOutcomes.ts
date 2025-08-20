// @ts-nocheck
import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type InteractiveOutcome = {
  id: string;
  user_id: string;
  course_id: string;
  score?: number | null;
  max?: number | null;
  passed?: boolean | null;
  pct?: number | null;
  topic?: string | null;
  created_at?: string | null;
};

export type InteractiveOutcomesGateway = {
  listRecentForCourse(courseId: string): Promise<InteractiveOutcome[]>;
  listRecentForTeacher(): Promise<InteractiveOutcome[]>;
  exportCsvUrl(courseId: string): string;
};

const outcomeSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  course_id: z.string(),
  score: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  passed: z.boolean().nullable().optional(),
  pct: z.number().nullable().optional(),
  topic: z.string().nullable().optional(),
  created_at: z.string().nullable().optional()
});

function buildHttpGateway(): InteractiveOutcomesGateway {
  return {
    async listRecentForCourse(courseId) {
      return fetchJson(
        `/api/runtime/outcomes?course_id=${encodeURIComponent(courseId)}`,
        z.array(outcomeSchema)
      );
    },
    async listRecentForTeacher() {
      // Teacher dashboard aggregates across owned courses
      return fetchJson(`/api/runtime/teacher/outcomes`, z.array(outcomeSchema));
    },
    exportCsvUrl(courseId) {
      return `/api/runtime/outcomes/export?course_id=${encodeURIComponent(courseId)}`;
    }
  };
}

function buildTestGateway(): InteractiveOutcomesGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): InteractiveOutcomesGateway {
  return buildHttpGateway();
}

export function createTestGateway(): InteractiveOutcomesGateway {
  return buildTestGateway();
}

export function createInteractiveOutcomesGateway(): InteractiveOutcomesGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}



