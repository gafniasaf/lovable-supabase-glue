"use client";
import React from "react";

export type TeacherAssignmentsListProps = {
  header?: { title?: string };
  actions?: Array<{ id: string; label: string; href: string }>;
  items: Array<{
    id: string;
    title: string;
    dueAt?: string | null;
    href?: string;
  }>;
  state?: "default" | "loading" | "empty";
};

const TeacherAssignmentsList: React.FC<TeacherAssignmentsListProps> = ({
  header = { title: "Assignments" },
  actions = [],
  items = [],
  state = "default",
}) => {
  if (state === "loading") {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-card rounded border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
            {actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((a) => (
                  <a key={a.id} href={a.href} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                    {a.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="text-muted-foreground">No assignments yet. Create your first assignment to get started.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((a) => (
                <a key={a.id} href={a.href} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                  {a.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="bg-card rounded-lg border divide-y">
          {items.map((it) => (
            <div key={it.id} data-testid="assignment-row" className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div>
                <div className="font-medium" data-testid="assignment-title">{it.title}</div>
                <div className="text-sm text-muted-foreground" data-testid="assignment-due">{it.dueAt || "No due date"}</div>
              </div>
              {it.href && (
                <a href={it.href} className="text-sm underline">Open</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeacherAssignmentsList;
