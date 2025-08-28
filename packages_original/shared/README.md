### @education/shared

Shared Zod schemas and env helpers used across the monorepo.

Exports:

- **Auth**: `userRole`, `loginRequest`, `profileResponse`
- **Users**: `updateRoleRequest`
- **Courses**: `course`, `courseCreateRequest`, `courseUpdateRequest`
- **Lessons**: `lesson`, `lessonCreateRequest`, `lessonReorderRequest`
- **Modules**: `moduleSchema`, `moduleCreateRequest`, `moduleUpdateRequest`
- **Enrollments**: `enrollment`, `enrollmentCreateRequest`
- **Assignments**: `assignment`, `assignmentCreateRequest`, `assignmentUpdateRequest`
- **Submissions**: `submission`, `submissionCreateRequest`, `submissionGradeRequest`
- **Quizzes**: `quiz`, `quizCreateRequest`, `quizUpdateRequest`, `quizQuestion`, `quizQuestionCreateRequest`, `quizChoice`, `quizChoiceCreateRequest`, `quizAttempt`, `quizAttemptStartRequest`, `quizAnswerUpsertRequest`, `quizAttemptSubmitRequest`
- **Env**: `envSchema`, `loadClientEnv`

Build:

```bash
npm run build
```


