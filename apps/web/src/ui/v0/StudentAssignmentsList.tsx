"use client";
import React from "react";

export type StudentAssignmentsListProps = {
  header?: { title?: string };
  items: Array<{ id: string; title: string; dueAt?: string | null; href: string }>;
  state?: "default" | "loading" | "empty";
};

export default function StudentAssignmentsList({ header = { title: "Assignments" }, items = [], state = "default" }: StudentAssignmentsListProps) {
  if (state === "loading") {
    return (
      <section className="p-6 space-y-3" aria-label="Assignments">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-card rounded border animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="p-6 space-y-3" aria-label="Assignments">
      <h1 className="text-xl font-semibold">{header.title}</h1>
      <ol className="space-y-2" data-testid="student-assignments-list">
        {items.map((a) => (
          <li key={a.id} className="border rounded p-3" data-testid="student-assignment-row">
            <div className="font-medium">{a.title}</div>
            <div className="mt-1 text-sm text-muted-foreground">Due: {a.dueAt ? new Date(a.dueAt).toLocaleString() : '—'}</div>
            <div className="mt-2">
              <a className="underline text-sm" href={a.href}>Open</a>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-muted-foreground">No assignments yet.</li>
        )}
      </ol>
    </section>
  );
}
