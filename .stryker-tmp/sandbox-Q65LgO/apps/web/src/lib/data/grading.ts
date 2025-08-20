// @ts-nocheck
import { z } from "zod";
import { isTestMode } from "@/lib/testMode";
import { getCurrentUser } from "@/lib/supabaseServer";
import { listUngradedSubmissionsForTeacher } from "@/server/services/submissions";
import { fetchJson } from "@/lib/serverFetch";

export type UngradedRow = {
  id: string;
  assignment_id: string;
  student_id: string;
  course_id: string | null;
  submitted_at: string;
  score: number | null;
};

export type GradingGateway = {
  listUngraded(options?: { courseId?: string; assignmentId?: string; page?: number; limit?: number }): Promise<{ rows: UngradedRow[]; totalEstimated: number }>;
  listAssignmentsForCourse(courseId: string): Promise<{ id: string; title: string }[]>;
};

function buildHttpGateway(): GradingGateway {
  return {
    async listUngraded(options) {
      // Prefer server service which handles ownership and pagination
      const user = await getCurrentUser();
      if (!user) return { rows: [], totalEstimated: 0 };
      return listUngradedSubmissionsForTeacher(user.id, options);
    },
    async listAssignmentsForCourse(courseId) {
      const schema = z.array(z.object({ id: z.string(), title: z.string() }));
      return fetchJson(`/api/assignments?course_id=${encodeURIComponent(courseId)}`, schema);
    }
  };
}

function buildTestGateway(): GradingGateway {
  return buildHttpGateway();
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



