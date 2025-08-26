"use client";
import React from "react";

export type StudentPlannerProps = {
  header?: { title?: string };
  items: Array<{ courseId: string; lessonCount: number; nextUpTitle: string; readingTimeMin: number; href: string }>;
  state?: "default" | "loading" | "empty";
};

export default function StudentPlanner({ header = { title: "Study planner" }, items = [], state = "default" }: StudentPlannerProps) {
  return (
    <section className="p-6 space-y-4" aria-label="Planner">
      <h1 className="text-xl font-semibold mb-2">{header.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="planner-grid">
        {items.map((it) => (
          <a key={it.courseId} href={it.href} className="border rounded p-3 hover:bg-muted/30" data-testid="planner-card">
            <div className="text-sm text-muted-foreground">Course ID</div>
            <div className="font-mono" data-testid="planner-course-id">{it.courseId}</div>
            <div className="text-sm text-muted-foreground mt-2">Lessons</div>
            <div className="font-medium" data-testid="planner-lesson-count">{it.lessonCount}</div>
            <div className="text-sm text-muted-foreground mt-2">Next up</div>
            <div className="font-medium" data-testid="planner-next-title">{it.nextUpTitle}</div>
            <div className="text-sm text-muted-foreground mt-2">Reading time (min)</div>
            <div className="font-medium" data-testid="planner-reading-min">{it.readingTimeMin}</div>
          </a>
        ))}
        {items.length === 0 && (
          <div className="text-muted-foreground">No enrollments yet.</div>
        )}
      </div>
    </section>
  );
}
