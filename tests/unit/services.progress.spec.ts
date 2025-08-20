import { markLessonComplete } from "../../apps/web/src/server/services/progress";

describe("progress service", () => {
  beforeEach(() => {
    process.env.TEST_MODE = "1";
  });

  test("markLessonComplete returns latest item", async () => {
    const userId = "test-student-id";
    const lessonId = "11111111-1111-1111-1111-111111111111";
    const out = await markLessonComplete(userId, lessonId);
    expect(out.lessonId).toBe(lessonId);
    expect(typeof out.completedAt).toBe("string");
  });
});


