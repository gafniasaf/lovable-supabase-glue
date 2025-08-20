import { z } from "zod";
import { fetchJson } from "@/lib/serverFetch";
import { isTestMode } from "@/lib/testMode";

export type TeacherProgressGateway = {
  getCountsByLesson(courseId: string): Promise<Record<string, number>>;
  listPerStudent(courseId: string): Promise<{
    student_id: string;
    completedLessons: number;
    totalLessons: number;
    percent: number;
    name?: string;
  }[]>;
};

const countsSchema = z.object({ counts: z.record(z.number()) });
const perStudentSchema = z.object({
  students: z.array(
    z.object({
      student_id: z.string(),
      completedLessons: z.number().int(),
      totalLessons: z.number().int(),
      percent: z.number().int(),
      name: z.string().optional()
    })
  )
});

function buildHttpGateway(): TeacherProgressGateway {
  return {
    async getCountsByLesson(courseId) {
      const res: z.infer<typeof countsSchema> = await fetchJson(
        `/api/progress?course_id=${encodeURIComponent(courseId)}&for_teacher=1`,
        countsSchema
      );
      return res.counts || {};
    },
    async listPerStudent(courseId) {
      const res: z.infer<typeof perStudentSchema> = await fetchJson(
        `/api/progress?course_id=${encodeURIComponent(courseId)}&per_student=1`,
        perStudentSchema
      );
      return res.students || [];
    }
  };
}

function buildTestGateway(): TeacherProgressGateway {
  return buildHttpGateway();
}

export function createHttpGateway(): TeacherProgressGateway {
  return buildHttpGateway();
}

export function createTestGateway(): TeacherProgressGateway {
  return buildTestGateway();
}

export function createTeacherProgressGateway(): TeacherProgressGateway {
  return isTestMode() ? createTestGateway() : createHttpGateway();
}



