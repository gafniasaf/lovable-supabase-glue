import { z } from "zod";
import { isTestMode } from "@/lib/testMode";
import { fetchJson } from "@/lib/serverFetch";
import { fetchJsonWithHeaders } from "@/lib/fetchJson";

export type UngradedRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  course_id: string | null;
  submitted_at: string;
  score: number | null;
};

export type GradingGateway = {
  listUngraded(options?: { courseId?: string; assignmentId?: string; page?: number; limit?: number }): Promise<{ rows: UngradedRow[]; totalEstimated: number; counts?: { graded: number; remaining: number } }>;
  listAssignmentsForCourse(courseId: string): Promise<{ id: string; title: string }[]>;
};

function buildHttpGateway(): GradingGateway {
  return {
    async listUngraded(options) {
      const qs = new URLSearchParams();
      if (options?.courseId) qs.set('courseId', options.courseId);
      if (options?.assignmentId) qs.set('assignmentId', options.assignmentId);
      if (options?.page != null) qs.set('page', String(options.page));
      if (options?.limit != null) qs.set('limit', String(options.limit));
      const listSchema = z.array(z.object({ id: z.string(), assignment_id: z.string(), student_id: z.string(), course_id: z.string().nullable().optional(), submitted_at: z.string(), score: z.number().nullable() }));
      const { data, headers } = await fetchJsonWithHeaders(listSchema as any, `/api/teacher/grading-queue${qs.toString() ? `?${qs.toString()}` : ''}`);
      const total = Number(headers.get('x-total-count') || 0);
      // counts are approximate (client-side) unless server provides richer metadata later
      const graded = 0;
      const remaining = total > 0 ? total : Math.max(0, (options?.page || 1) * (options?.limit || 20));
      return { rows: data as any, totalEstimated: total || remaining, counts: { graded, remaining } };
    },
    async listAssignmentsForCourse(courseId) {
      const schema = z.array(z.object({ id: z.string(), title: z.string() }));
      return fetchJson(`/api/assignments?course_id=${encodeURIComponent(courseId)}`, schema);
    }
  };
}

function buildTestGateway(): GradingGateway {
  return {
    async listUngraded(options) {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 20;
      const totalEstimated = 123;
      const start = (page - 1) * limit;
      const now = Date.now();
      const rows = Array.from({ length: limit }).map((_, i) => ({
        id: `sb-${start + i + 1}`,
        assignment_id: `as-${((start + i) % 7) + 1}`,
        student_id: `st-${((start + i) % 11) + 1}`,
        course_id: `co-${((start + i) % 5) + 1}`,
        submitted_at: new Date(now - (start + i) * 60000).toISOString(),
        score: null
      }));
      return { rows, totalEstimated };
    },
    async listAssignmentsForCourse(courseId) {
      return Array.from({ length: 5 }).map((_, i) => ({ id: `${courseId}-a-${i + 1}`, title: `Assignment ${i + 1}` }));
    }
  } as GradingGateway;
}

export function createHttpGateway(): GradingGateway {
  return buildHttpGateway();
}

export function createTestGateway(): GradingGateway {
  return buildTestGateway();
}

export function createGradingGateway(): GradingGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}



