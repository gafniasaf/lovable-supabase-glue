/**
 * In-memory test store (dev/test only)
 *
 * Provides a lightweight, process-local data store used when `TEST_MODE`
 * is enabled. It simulates database behavior for e2e and unit tests, and
 * persists across Next.js HMR by attaching to `globalThis`.
 */
type TestCourse = {
  id: string;
  title: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
};

type TestLesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
};

type TestModule = {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  created_at: string;
};

type TestEnrollment = {
  id: string;
  student_id: string;
  course_id: string;
  created_at: string;
};

type TestAssignment = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  points: number;
  created_at: string;
};

type TestSubmission = {
  id: string;
  assignment_id: string;
  student_id: string;
  text: string;
  file_url: string | null;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
};

type TestProfile = {
	id: string;
	email: string;
	role: "student" | "teacher" | "parent" | "admin";
};

type TestParentLink = {
	id: string;
	parent_id: string;
	student_id: string;
	created_at: string;
};

// Persist state across Next.js dev HMR by attaching to globalThis
const globalStore = globalThis as any;
const state: {
  courses: Map<string, TestCourse>;
  lessonsByCourse: Map<string, TestLesson[]>;
  modulesByCourse: Map<string, TestModule[]>;
  enrollmentsByStudent: Map<string, TestEnrollment[]>;
  enrollmentsByCourse: Map<string, TestEnrollment[]>;
  profilesById: Map<string, TestProfile>;
  parentLinksByParent: Map<string, TestParentLink[]>;
  // Files (test-mode storage)
  filesById?: Map<string, { id: string; owner_type: string; owner_id: string; content_type: string; data_base64: string; created_at: string }>;
  announcementsByCourse?: Map<string, { id: string; course_id: string; teacher_id: string; title: string; body: string; publish_at: string | null; created_at: string }[]>;
  assignmentsByCourse?: Map<string, TestAssignment[]>;
  submissionsByAssignment?: Map<string, TestSubmission[]>;
  quizzesByCourse?: Map<string, any[]>;
  questionsByQuiz?: Map<string, any[]>;
  choicesByQuestion?: Map<string, any[]>;
  attemptsByQuiz?: Map<string, any[]>;
  answersByAttempt?: Map<string, any[]>;
  // Messaging
  messageThreads?: { id: string; created_at: string }[];
  participantsByThread?: Map<string, { thread_id: string; user_id: string; role: string; added_at: string }[]>;
  messagesByThread?: Map<string, { id: string; thread_id: string; sender_id: string; body: string; created_at: string; read_at: string | null }[]>;
  // Per-user read receipts for messages (test-mode only)
  readByMessage?: Map<string, Set<string>>;
  // Feature flags
  featureFlags?: Map<string, boolean>;
} = globalStore.__TEST_STORE__ || (globalStore.__TEST_STORE__ = {
  courses: new Map<string, TestCourse>(),
  lessonsByCourse: new Map<string, TestLesson[]>(),
  modulesByCourse: new Map<string, TestModule[]>(),
  enrollmentsByStudent: new Map<string, TestEnrollment[]>(),
  enrollmentsByCourse: new Map<string, TestEnrollment[]>(),
  profilesById: new Map<string, TestProfile>(),
  parentLinksByParent: new Map<string, TestParentLink[]>()
});

// Backfill maps if this module loaded after an older store shape was created (HMR during dev)
const anyState = state as any;
if (!anyState.profilesById) anyState.profilesById = new Map<string, TestProfile>();
if (!anyState.parentLinksByParent) anyState.parentLinksByParent = new Map<string, TestParentLink[]>();
if (!anyState.modulesByCourse) anyState.modulesByCourse = new Map<string, TestModule[]>();
if (!anyState.assignmentsByCourse) anyState.assignmentsByCourse = new Map<string, TestAssignment[]>();
if (!anyState.submissionsByAssignment) anyState.submissionsByAssignment = new Map<string, TestSubmission[]>();
// Quizzes store maps (backfill if missing for HMR)
if (!anyState.quizzesByCourse) anyState.quizzesByCourse = new Map<string, any[]>();
if (!anyState.questionsByQuiz) anyState.questionsByQuiz = new Map<string, any[]>();
if (!anyState.choicesByQuestion) anyState.choicesByQuestion = new Map<string, any[]>();
if (!anyState.attemptsByQuiz) anyState.attemptsByQuiz = new Map<string, any[]>();
if (!anyState.answersByAttempt) anyState.answersByAttempt = new Map<string, any[]>();
if (!anyState.announcementsByCourse) anyState.announcementsByCourse = new Map<string, any[]>();
if (!anyState.filesById) anyState.filesById = new Map<string, any>();
// Messaging maps
if (!anyState.messageThreads) anyState.messageThreads = [];
if (!anyState.participantsByThread) anyState.participantsByThread = new Map<string, any[]>();
if (!anyState.messagesByThread) anyState.messagesByThread = new Map<string, any[]>();
if (!anyState.readByMessage) anyState.readByMessage = new Map<string, Set<string>>();
if (!anyState.featureFlags) anyState.featureFlags = new Map<string, boolean>();

export function addTestCourse(course: TestCourse) {
  state.courses.set(course.id, course);
}

export function getTestCourse(courseId: string): TestCourse | undefined {
  return state.courses.get(courseId);
}

export function listTestCoursesByTeacher(teacherId: string): TestCourse[] {
  return Array.from(state.courses.values()).filter(c => c.teacher_id === teacherId);
}

export function addTestLesson(lesson: TestLesson) {
  const arr = state.lessonsByCourse.get(lesson.course_id) ?? [];
  arr.push(lesson);
  arr.sort((a, b) => a.order_index - b.order_index);
  state.lessonsByCourse.set(lesson.course_id, arr);
}

export function listTestLessonsByCourse(courseId: string): TestLesson[] {
  return state.lessonsByCourse.get(courseId) ?? [];
}

export function resetTestStore() {
  state.courses.clear();
  state.lessonsByCourse.clear();
  state.modulesByCourse.clear();
  state.enrollmentsByStudent.clear();
  state.enrollmentsByCourse.clear();
  state.parentLinksByParent.clear();
  (state as any).assignmentsByCourse?.clear?.();
  (state as any).submissionsByAssignment?.clear?.();
  // Quizzes
  (state as any).quizzesByCourse?.clear?.();
  (state as any).questionsByQuiz?.clear?.();
  (state as any).choicesByQuestion?.clear?.();
  (state as any).attemptsByQuiz?.clear?.();
  (state as any).answersByAttempt?.clear?.();
  (state as any).announcementsByCourse?.clear?.();
  (state as any).messageThreads = [];
  (state as any).participantsByThread?.clear?.();
  (state as any).messagesByThread?.clear?.();
  (state as any).filesById?.clear?.();
}

export function deleteTestCourse(courseId: string) {
  state.courses.delete(courseId);
  state.lessonsByCourse.delete(courseId);
  // Note: we intentionally do not clear enrollments to keep history unless needed
}

export function reorderTestLessons(courseId: string, updates: { id: string; order_index: number }[]) {
  const arr = state.lessonsByCourse.get(courseId) ?? [];
  const byId = new Map(arr.map(l => [l.id, l] as const));
  for (const u of updates) {
    const row = byId.get(u.id);
    if (row) row.order_index = u.order_index;
  }
  arr.sort((a, b) => a.order_index - b.order_index);
  state.lessonsByCourse.set(courseId, arr);
}

export function addTestModule(row: TestModule) {
  const arr = state.modulesByCourse.get(row.course_id) ?? [];
  arr.push(row);
  arr.sort((a, b) => a.order_index - b.order_index);
  state.modulesByCourse.set(row.course_id, arr);
}

export function listTestModulesByCourse(courseId: string): TestModule[] {
  return state.modulesByCourse.get(courseId) ?? [];
}

export function updateTestModule(id: string, data: Partial<Pick<TestModule, 'title' | 'order_index'>>) {
  for (const [courseId, arr] of state.modulesByCourse.entries()) {
    const idx = arr.findIndex(m => m.id === id);
    if (idx >= 0) {
      const updated = { ...arr[idx], ...data } as TestModule;
      arr[idx] = updated;
      arr.sort((a, b) => a.order_index - b.order_index);
      state.modulesByCourse.set(courseId, arr);
      return updated;
    }
  }
  return undefined;
}

export function deleteTestModule(id: string) {
  for (const [courseId, arr] of state.modulesByCourse.entries()) {
    const filtered = arr.filter(m => m.id !== id);
    if (filtered.length !== arr.length) {
      state.modulesByCourse.set(courseId, filtered);
      break;
    }
  }
}

export function addTestEnrollment(row: TestEnrollment) {
  const a = state.enrollmentsByStudent.get(row.student_id) ?? [];
  a.push(row);
  state.enrollmentsByStudent.set(row.student_id, a);
  const b = state.enrollmentsByCourse.get(row.course_id) ?? [];
  b.push(row);
  state.enrollmentsByCourse.set(row.course_id, b);
}

export function listTestEnrollmentsByStudent(studentId: string): TestEnrollment[] {
  return state.enrollmentsByStudent.get(studentId) ?? [];
}

export function listTestEnrollmentsByCourse(courseId: string): TestEnrollment[] {
  return state.enrollmentsByCourse.get(courseId) ?? [];
}

export function upsertTestProfile(profile: TestProfile) {
	state.profilesById.set(profile.id, profile);
}

export function getTestProfile(id: string): TestProfile | undefined {
	return state.profilesById.get(id);
}

export function addTestParentLink(row: TestParentLink) {
	const a = state.parentLinksByParent.get(row.parent_id) ?? [];
	a.push(row);
	state.parentLinksByParent.set(row.parent_id, a);
}

export function listTestParentChildren(parentId: string): TestParentLink[] {
	return state.parentLinksByParent.get(parentId) ?? [];
}

export function removeTestParentLink(parentId: string, studentId: string) {
	const a = state.parentLinksByParent.get(parentId) ?? [];
	const b = a.filter(x => x.student_id !== studentId);
	state.parentLinksByParent.set(parentId, b);
}

export function listTestParentsForStudent(studentId: string): string[] {
	const res: string[] = [];
	for (const [pid, arr] of state.parentLinksByParent.entries()) {
		if ((arr ?? []).some(pl => pl.student_id === studentId)) res.push(pid);
	}
	return res;
}

// Announcements helpers (test-mode)
export function addTestAnnouncement(row: { id: string; course_id: string; teacher_id: string; title: string; body: string; publish_at: string | null; created_at: string }) {
  const s = state as any;
  const arr = s.announcementsByCourse.get(row.course_id) ?? [];
  arr.unshift(row);
  s.announcementsByCourse.set(row.course_id, arr);
}

export function listTestAnnouncementsByCourse(courseId: string) {
  const s = state as any;
  return (s.announcementsByCourse.get(courseId) ?? []).slice();
}

export function deleteTestAnnouncement(id: string) {
  const s = state as any;
  for (const [cid, arr] of s.announcementsByCourse.entries()) {
    const next = arr.filter((x: any) => x.id !== id);
    if (next.length !== arr.length) {
      s.announcementsByCourse.set(cid, next);
      return { ok: true } as const;
    }
  }
  return { ok: false } as const;
}

// ===== Messaging helpers (test-mode) =====
export function createTestThread(participantIds: string[], roles?: Record<string, string>) {
  const id = makeId('th');
  const created_at = new Date().toISOString();
  const s = state as any;
  s.messageThreads.push({ id, created_at });
  const parts = participantIds.map(uid => ({ thread_id: id, user_id: uid, role: roles?.[uid] ?? 'user', added_at: created_at }));
  s.participantsByThread.set(id, parts);
  return { id, created_at } as const;
}

export function listTestThreadsByUser(userId: string) {
  const s = state as any;
  const res: { id: string; created_at: string }[] = [];
  for (const t of s.messageThreads as { id: string; created_at: string }[]) {
    const parts = (s.participantsByThread.get(t.id) ?? []) as any[];
    if (parts.some(p => p.user_id === userId)) res.push(t);
  }
  // newest first
  res.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return res;
}

export function addTestMessage(row: { thread_id: string; sender_id: string; body: string }) {
  const id = makeId('ms');
  const created_at = new Date().toISOString();
  const msg = { id, thread_id: row.thread_id, sender_id: row.sender_id, body: row.body, created_at, read_at: null };
  const s = state as any;
  const arr = s.messagesByThread.get(row.thread_id) ?? [];
  arr.push(msg);
  arr.sort((a: any, b: any) => a.created_at.localeCompare(b.created_at));
  s.messagesByThread.set(row.thread_id, arr);
  // Initialize read receipts map
  if (!s.readByMessage) s.readByMessage = new Map<string, Set<string>>();
  s.readByMessage.set(id, new Set<string>());
  return msg;
}

export function listTestMessagesByThread(threadId: string) {
  const s = state as any;
  return (s.messagesByThread.get(threadId) ?? []).slice();
}

export function markTestMessageReadForUser(messageId: string, userId: string) {
  const s = state as any;
  if (!s.readByMessage) s.readByMessage = new Map<string, Set<string>>();
  const set = s.readByMessage.get(messageId) ?? new Set<string>();
  set.add(userId);
  s.readByMessage.set(messageId, set);
  // Keep legacy read_at for basic UIs
  for (const [tid, arr] of s.messagesByThread.entries()) {
    const idx = arr.findIndex((m: any) => m.id === messageId);
    if (idx >= 0) {
      if (!arr[idx].read_at) arr[idx] = { ...arr[idx], read_at: new Date().toISOString() };
      s.messagesByThread.set(tid, arr);
      return arr[idx];
    }
  }
  return null;
}

export function countUnreadForThread(threadId: string, userId: string): number {
  const s = state as any;
  if (!s.readByMessage) s.readByMessage = new Map<string, Set<string>>();
  const msgs = (s.messagesByThread.get(threadId) ?? []) as any[];
  let count = 0;
  for (const m of msgs) {
    if (m.sender_id === userId) continue;
    const readSet = s.readByMessage.get(m.id) as Set<string> | undefined;
    if (!readSet || !readSet.has(userId)) count++;
  }
  return count;
}

export function markAllThreadMessagesReadForUser(threadId: string, userId: string) {
  const s = state as any;
  if (!s.readByMessage) s.readByMessage = new Map<string, Set<string>>();
  const msgs = (s.messagesByThread.get(threadId) ?? []) as any[];
  for (const m of msgs) {
    if (m.sender_id === userId) continue;
    const set = (s.readByMessage.get(m.id) as Set<string> | undefined) ?? new Set<string>();
    set.add(userId);
    s.readByMessage.set(m.id, set);
  }
  return { ok: true } as const;
}

// ===== Feature Flags (test-mode) =====
export function listTestFeatureFlags(): Record<string, boolean> {
  const s = state as any;
  if (!s.featureFlags) s.featureFlags = new Map<string, boolean>();
  const obj: Record<string, boolean> = {};
  for (const [k, v] of s.featureFlags.entries()) obj[k] = !!v;
  return obj;
}

export function setTestFeatureFlag(key: string, value: boolean) {
  const s = state as any;
  if (!s.featureFlags) s.featureFlags = new Map<string, boolean>();
  s.featureFlags.set(key, !!value);
  return { key, value: !!value } as const;
}

export function listTestParticipantsByThread(threadId: string) {
  const s = state as any;
  return (s.participantsByThread.get(threadId) ?? []).slice();
}

// ===== Notifications helpers (test-mode) =====
export function addTestNotification(row: { id?: string; user_id: string; type: string; payload?: any }) {
  const s = state as any;
  if (!s.notificationsByUser) s.notificationsByUser = new Map<string, any[]>();
  const id = row.id ?? makeId('no');
  const created_at = new Date().toISOString();
  const obj = { id, user_id: row.user_id, type: row.type, payload: row.payload ?? {}, created_at, read_at: null };
  const arr = s.notificationsByUser.get(row.user_id) ?? [];
  arr.unshift(obj);
  s.notificationsByUser.set(row.user_id, arr);
  return obj;
}

export function listTestNotificationsByUser(userId: string) {
  const s = state as any;
  if (!s.notificationsByUser) s.notificationsByUser = new Map<string, any[]>();
  return (s.notificationsByUser.get(userId) ?? []).slice();
}

export function markTestNotificationRead(id: string) {
  const s = state as any;
  if (!s.notificationsByUser) s.notificationsByUser = new Map<string, any[]>();
  for (const [uid, arr] of s.notificationsByUser.entries()) {
    const idx = arr.findIndex((n: any) => n.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], read_at: new Date().toISOString() };
      s.notificationsByUser.set(uid, arr);
      return arr[idx];
    }
  }
  return null;
}

export function markAllTestNotificationsRead(userId: string) {
  const s = state as any;
  if (!s.notificationsByUser) s.notificationsByUser = new Map<string, any[]>();
  const arr = (s.notificationsByUser.get(userId) ?? []).map((n: any) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }));
  s.notificationsByUser.set(userId, arr);
  return { ok: true } as const;
}

// ===== Notification preferences (test-mode) =====
type TestNotificationPrefs = { [type: string]: boolean };
const DEFAULT_PREFS: TestNotificationPrefs = {
  'assignment:new': true,
  'submission:graded': true,
  'message:new': true,
  'announcement:published': true,
  'quiz:due-soon': true
};

export function getTestNotificationPreferences(userId: string): TestNotificationPrefs {
  const s = state as any;
  if (!s.notificationPrefsByUser) s.notificationPrefsByUser = new Map<string, TestNotificationPrefs>();
  const current = s.notificationPrefsByUser.get(userId);
  if (current) return { ...DEFAULT_PREFS, ...current };
  return { ...DEFAULT_PREFS };
}

export function setTestNotificationPreferences(userId: string, partial: TestNotificationPrefs) {
  const s = state as any;
  if (!s.notificationPrefsByUser) s.notificationPrefsByUser = new Map<string, TestNotificationPrefs>();
  const merged = { ...getTestNotificationPreferences(userId), ...partial } as TestNotificationPrefs;
  s.notificationPrefsByUser.set(userId, merged);
  return merged;
}

export function shouldDeliverTestNotification(userId: string, type: string): boolean {
  const prefs = getTestNotificationPreferences(userId);
  const val = prefs[type];
  return val === undefined ? true : !!val;
}

// Assignments helpers
export function addTestAssignment(row: TestAssignment) {
  const s = state as any;
  const arr = s.assignmentsByCourse.get(row.course_id) ?? [];
  arr.push(row);
  arr.sort((a: TestAssignment, b: TestAssignment) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  s.assignmentsByCourse.set(row.course_id, arr);
}

export function listTestAssignmentsByCourse(courseId: string): TestAssignment[] {
  const s = state as any;
  return s.assignmentsByCourse.get(courseId) ?? [];
}

export function updateTestAssignment(id: string, data: Partial<Omit<TestAssignment, 'id' | 'course_id' | 'created_at'>>) {
  const s = state as any;
  for (const [courseId, arr] of s.assignmentsByCourse.entries()) {
    const idx = arr.findIndex((x: TestAssignment) => x.id === id);
    if (idx >= 0) {
      const next = { ...arr[idx], ...data } as TestAssignment;
      arr[idx] = next;
      s.assignmentsByCourse.set(courseId, arr);
      return next;
    }
  }
  return null;
}

export function deleteTestAssignment(id: string) {
  const s = state as any;
  for (const [courseId, arr] of s.assignmentsByCourse.entries()) {
    const next = arr.filter((x: TestAssignment) => x.id !== id);
    s.assignmentsByCourse.set(courseId, next);
  }
  return { ok: true } as const;
}

// ===== Files (test-mode) =====
export function addTestFile(input: { owner_type: string; owner_id: string; content_type: string; data_base64: string }) {
  const id = makeId('f');
  const row = { id, owner_type: input.owner_type, owner_id: input.owner_id, content_type: input.content_type, data_base64: input.data_base64, created_at: new Date().toISOString() };
  const s = state as any;
  s.filesById.set(id, row);
  return row;
}

export function getTestFile(id: string) {
  const s = state as any;
  return s.filesById.get(id) ?? null;
}

// Submissions helpers
export function addTestSubmission(row: TestSubmission) {
  const s = state as any;
  const arr = s.submissionsByAssignment.get(row.assignment_id) ?? [];
  arr.unshift(row);
  s.submissionsByAssignment.set(row.assignment_id, arr);
}

export function listTestSubmissionsByAssignment(assignmentId: string): TestSubmission[] {
  const s = state as any;
  return s.submissionsByAssignment.get(assignmentId) ?? [];
}

export function gradeTestSubmission(id: string, data: { score: number; feedback?: string }) {
  const s = state as any;
  for (const [aid, arr] of s.submissionsByAssignment.entries()) {
    const idx = arr.findIndex((x: TestSubmission) => x.id === id);
    if (idx >= 0) {
      const next = { ...arr[idx], score: data.score, feedback: data.feedback ?? null } as TestSubmission;
      arr[idx] = next;
      s.submissionsByAssignment.set(aid, arr);
      return next;
    }
  }
  return null;
}

// ===== Quizzes helpers (test-mode) =====
type TestQuiz = { id: string; course_id: string; title: string; time_limit_sec?: number | null; points: number; created_at: string };
type TestQuizQuestion = { id: string; quiz_id: string; text: string; order_index: number };
type TestQuizChoice = { id: string; question_id: string; text: string; correct: boolean; order_index: number };
type TestQuizAttempt = { id: string; quiz_id: string; student_id: string; started_at: string; submitted_at?: string | null; score: number };
type TestQuizAnswer = { id: string; attempt_id: string; question_id: string; choice_id: string; created_at: string };

function makeId(_prefix: string) {
  const hex = '0123456789abcdef';
  const rand = (n: number) => Array.from({ length: n }, () => hex[Math.floor(Math.random() * hex.length)]).join('');
  const s1 = rand(8);
  const s2 = rand(4);
  const s3 = rand(4);
  const s4 = rand(4);
  const s5 = rand(12);
  return `${s1}-${s2}-${s3}-${s4}-${s5}`;
}

export function addQuiz(input: { course_id: string; title: string; time_limit_sec?: number; points?: number }): TestQuiz {
  const row: TestQuiz = {
    id: makeId('q'),
    course_id: input.course_id,
    title: input.title,
    time_limit_sec: input.time_limit_sec ?? null,
    points: input.points ?? 100,
    created_at: new Date().toISOString()
  };
  const s = state as any;
  const arr = s.quizzesByCourse.get(row.course_id) ?? [];
  arr.unshift(row);
  s.quizzesByCourse.set(row.course_id, arr);
  return row;
}

export function listQuizzesByCourse(courseId: string): TestQuiz[] {
  const s = state as any;
  return (s.quizzesByCourse.get(courseId) ?? []).slice();
}

export function updateQuiz(id: string, data: { title?: string; time_limit_sec?: number; points?: number }) {
  const s = state as any;
  for (const [courseId, arr] of s.quizzesByCourse.entries()) {
    const idx = arr.findIndex((q: TestQuiz) => q.id === id);
    if (idx >= 0) {
      const q = arr[idx];
      const updated = { ...q, ...data } as TestQuiz;
      arr[idx] = updated;
      s.quizzesByCourse.set(courseId, arr);
      return updated;
    }
  }
  return null;
}

export function deleteQuiz(id: string) {
  const s = state as any;
  for (const [courseId, arr] of s.quizzesByCourse.entries()) {
    const next = (arr as TestQuiz[]).filter(q => q.id !== id);
    if (next.length !== arr.length) {
      s.quizzesByCourse.set(courseId, next);
      // Cascade: remove questions for this quiz
      s.questionsByQuiz.delete(id);
      return { ok: true } as const;
    }
  }
  return { ok: false } as const;
}

export function addQuestion(input: { quiz_id: string; text: string; order_index?: number }): TestQuizQuestion {
  const row: TestQuizQuestion = { id: makeId('r'), quiz_id: input.quiz_id, text: input.text, order_index: input.order_index ?? 1 };
  const s = state as any;
  const arr = s.questionsByQuiz.get(row.quiz_id) ?? [];
  arr.push(row);
  arr.sort((a: TestQuizQuestion, b: TestQuizQuestion) => a.order_index - b.order_index);
  s.questionsByQuiz.set(row.quiz_id, arr);
  return row;
}

export function listQuestionsByQuiz(quizId: string): TestQuizQuestion[] {
  const s = state as any;
  return (s.questionsByQuiz.get(quizId) ?? []).slice();
}

export function addChoice(input: { question_id: string; text: string; correct: boolean; order_index?: number }): TestQuizChoice {
  const row: TestQuizChoice = { id: makeId('s'), question_id: input.question_id, text: input.text, correct: input.correct, order_index: input.order_index ?? 1 };
  const s = state as any;
  const arr = s.choicesByQuestion.get(row.question_id) ?? [];
  arr.push(row);
  arr.sort((a: TestQuizChoice, b: TestQuizChoice) => a.order_index - b.order_index);
  s.choicesByQuestion.set(row.question_id, arr);
  return row;
}

export function listChoicesByQuestion(questionId: string): TestQuizChoice[] {
  const s = state as any;
  return (s.choicesByQuestion.get(questionId) ?? []).slice();
}

export function startAttempt(input: { quiz_id: string; student_id: string }): TestQuizAttempt {
  const row: TestQuizAttempt = { id: makeId('t'), quiz_id: input.quiz_id, student_id: input.student_id, started_at: new Date().toISOString(), submitted_at: null, score: 0 };
  const s = state as any;
  const arr = s.attemptsByQuiz.get(row.quiz_id) ?? [];
  arr.push(row);
  s.attemptsByQuiz.set(row.quiz_id, arr);
  return row;
}

export function upsertAnswer(input: { attempt_id: string; question_id: string; choice_id: string }): TestQuizAnswer {
  const s = state as any;
  const ansArr = s.answersByAttempt.get(input.attempt_id) ?? [];
  const idx = ansArr.findIndex((a: TestQuizAnswer) => a.question_id === input.question_id);
  const row: TestQuizAnswer = idx >= 0 ? { ...ansArr[idx], choice_id: input.choice_id, created_at: new Date().toISOString() } : {
    id: makeId('u'), attempt_id: input.attempt_id, question_id: input.question_id, choice_id: input.choice_id, created_at: new Date().toISOString()
  };
  if (idx >= 0) ansArr[idx] = row; else ansArr.push(row);
  s.answersByAttempt.set(input.attempt_id, ansArr);
  return row;
}

export function submitAttempt(input: { attempt_id: string }): TestQuizAttempt | null {
  const s = state as any;
  let attempt: TestQuizAttempt | undefined;
  let quizId: string | undefined;
  for (const [qid, arr] of s.attemptsByQuiz.entries()) {
    const found = (arr as TestQuizAttempt[]).find(a => a.id === input.attempt_id);
    if (found) { attempt = found; quizId = qid; break; }
  }
  if (!attempt || !quizId) return null;
  const questions: TestQuizQuestion[] = s.questionsByQuiz.get(quizId) ?? [];
  const total = questions.length;
  const answers: TestQuizAnswer[] = s.answersByAttempt.get(attempt.id) ?? [];
  let correct = 0;
  for (const q of questions) {
    const a = answers.find(x => x.question_id === q.id);
    if (!a) continue;
    const choices: TestQuizChoice[] = s.choicesByQuestion.get(q.id) ?? [];
    const correctChoice = choices.find(c => c.correct);
    if (correctChoice && a.choice_id === correctChoice.id) correct++;
  }
  let quizPoints = 100;
  for (const [, quizzes] of s.quizzesByCourse.entries()) {
    const match = (quizzes as TestQuiz[]).find((q: TestQuiz) => q.id === quizId);
    if (match) { quizPoints = match.points; break; }
  }
  const score = total > 0 ? Math.round((correct / total) * quizPoints) : 0;
  attempt.submitted_at = new Date().toISOString();
  attempt.score = score;
  return attempt;
}

export function listAttemptsForQuiz(quiz_id: string): TestQuizAttempt[] {
  const s = state as any;
  return (s.attemptsByQuiz.get(quiz_id) ?? []).slice();
}

export function getAttemptForStudent(quiz_id: string, student_id: string): TestQuizAttempt | null {
  const s = state as any;
  const arr: TestQuizAttempt[] = s.attemptsByQuiz.get(quiz_id) ?? [];
  const mine = arr.filter(a => a.student_id === student_id);
  if (mine.length === 0) return null;
  mine.sort((a, b) => b.started_at.localeCompare(a.started_at));
  return mine[0];
}

