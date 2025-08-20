/**
 * Shared schemas and types re-exports.
 *
 * This package centralizes Zod schemas and TypeScript types used across the
 * app. Import from the package entrypoint rather than deep paths to keep
 * imports consistent:
 *
 *   import type { Course, Lesson } from "@education/shared";
 *
 * It also re-exports environment helpers where applicable.
 */
// @ts-nocheck

export * from "./schemas/auth";
export * from "./schemas/course";
export * from "./schemas/lesson";
export * from "./schemas/enrollment";
export * from "./schemas/parentLink";
export * from "./schemas/user";
export * from "./schemas/module";
export * from "./schemas/assignment";
export * from "./schemas/submission";
export * from "./env";

export * from "./schemas/quiz";
export * from "./schemas/quizQuestion";
export * from "./schemas/quizChoice";
export * from "./schemas/quizAttempt";
export * from "./schemas/announcement";
export * from "./schemas/message";
export * from "./schemas/notification";
export * from "./schemas/event";
export * from "./schemas/common";
export * from "./schemas/dashboard";
export * from "./schemas/progress";
export * from "./schemas/interactive";
export * from "./schemas/registry";
export * from "./schemas/ids";

// DTOs
export * from "./dto";

