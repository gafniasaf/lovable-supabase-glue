"use client";
import React from "react";

export type StudentDashboardOverviewProps = {
  header?: { title?: string };
  streakDays?: number;
  navLinks?: Array<{ id: string; label: string; href: string }>;
  notifications: Array<{ id: string; type: string; at: string; href?: string; extra?: string | null }>; // at = ISO
  courses: Array<{ id: string; title: string; percent: number; completed: number; total: number; href: string }>;
  state?: "default" | "loading" | "empty";
};

export default function StudentDashboardOverview({ header = { title: "Student dashboard" }, streakDays = 0, navLinks = [], notifications = [], courses = [], state = "default" }: StudentDashboardOverviewProps) {
  if (state === "loading") {
    return (
      <section className="p-6 space-y-4">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded border animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded p-3">
              <div className="h-4 w-40 bg-muted rounded mb-2" />
              <div className="h-2 w-full bg-muted rounded" />
              <div className="h-2 w-1/2 bg-muted rounded mt-1" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
        {navLinks.length > 0 && (
          <div className="text-sm text-muted-foreground hidden sm:block">
            {navLinks.map((l, i) => (
              <span key={l.id}>
                <a className="underline" href={l.href}>{l.label}</a>
                {i < navLinks.length - 1 && <span className="mx-2">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <section className="border rounded p-4 bg-card">
        <h2 className="font-medium flex items-center gap-2"><span>🔥</span> <span>Streak</span></h2>
        <div className="mt-2 text-sm text-foreground"><span className="text-2xl font-semibold">{streakDays}</span> days</div>
        <div className="text-xs text-muted-foreground mt-1">Keep it up — learning every day builds momentum.</div>
      </section>

      <section>
        <h2 className="font-medium">Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-muted-foreground">No notifications</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {notifications.slice(0,5).map((n) => (
              <li key={n.id} className="text-sm">
                <span className="font-medium">{n.type}</span>
                <span className="ml-2 text-muted-foreground">{new Date(n.at).toLocaleString()}</span>
                {n.extra && <span className="ml-2">{n.extra}</span>}
                {n.href && <a className="ml-2 underline" href={n.href}>Open</a>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-medium">My courses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3" data-testid="student-courses-grid">
          {courses.map((r) => (
            <a key={r.id} data-testid="student-course-card" href={r.href} className="block border rounded p-3 hover:bg-muted/30">
              <div className="font-medium">{r.title}</div>
              <div className="mt-2 h-2 bg-muted rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${Math.round(r.percent)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{r.completed}/{r.total} lessons</div>
            </a>
          ))}
          {courses.length === 0 && (
            <div className="text-muted-foreground">
              No enrollments yet. <span className="ml-2">Ask your teacher to enroll you or explore available courses.</span>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
