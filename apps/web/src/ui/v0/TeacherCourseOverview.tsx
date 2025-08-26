"use client";
import React from "react";

export type TeacherCourseOverviewProps = {
  header: {
    title: string;
    description?: string | null;
    tabLinks: Array<{ id: string; label: string; href: string; current?: boolean }>;
    actions: Array<{ id: string; label: string; href: string }>;
  };
  lessons: Array<{ id: string; order: number; title: string; completedCount?: number }>;
  perStudent: Array<{ id: string; name: string; completed: number; total: number; percent: number }>;
  attempts: Array<{ id: string; userId: string; score?: number | null; max?: number | null; passed?: boolean | null; pct?: number | null; topic?: string | null; at?: string | null }>;
  state?: "default" | "loading" | "empty";
};

export default function TeacherCourseOverview({ header, lessons, perStudent, attempts, state = "default" }: TeacherCourseOverviewProps) {
  const Tabs = (
    <div className="border-b mb-4">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {header.tabLinks.map((t) => (
          <a key={t.id} href={t.href} className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${t.current ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>{t.label}</a>
        ))}
      </nav>
    </div>
  );

  if (state === "loading") {
    return (
      <section className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-80 bg-muted rounded animate-pulse" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-48 bg-card border rounded animate-pulse" />
            <div className="h-48 bg-card border rounded animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="p-6">
        <div className="max-w-6xl mx-auto">
          {Tabs}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
            <div className="flex items-center gap-2">
              {header.actions.map((a) => (
                <a key={a.id} href={a.href} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md">{a.label}</a>
              ))}
            </div>
          </div>
          {header.description && <p className="text-muted-foreground mb-4">{header.description}</p>}
          <div className="text-muted-foreground">No content yet for this course.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {Tabs}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
            {header.description && <p className="text-muted-foreground">{header.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {header.actions.map((a) => (
              <a key={a.id} href={a.href} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">{a.label}</a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Lessons</h2>
          <div className="bg-card rounded-lg border divide-y">
            {lessons.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between">
                <span>#{l.order} - {l.title}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">completed by {l.completedCount ?? 0}</span>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="p-4 text-muted-foreground">No lessons yet.</div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Student progress</h2>
          {perStudent.length === 0 ? (
            <div className="text-muted-foreground">No enrolled students yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Completed</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Percent</th>
                  </tr>
                </thead>
                <tbody>
                  {perStudent.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-2 border">{s.name}</td>
                      <td className="p-2 border">{s.completed}</td>
                      <td className="p-2 border">{s.total}</td>
                      <td className="p-2 border">{s.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Interactive attempts</h2>
            {/* Export is rendered externally */}
          </div>
          {attempts.length === 0 ? (
            <div className="text-muted-foreground">No interactive attempts yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded">
                <thead>
                  <tr className="bg-muted/50 text-left">
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Score</th>
                    <th className="p-2 border">Max</th>
                    <th className="p-2 border">Passed</th>
                    <th className="p-2 border">Pct</th>
                    <th className="p-2 border">Topic</th>
                    <th className="p-2 border">At</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((r) => (
                    <tr key={r.id} className="border-b">
                      <td className="p-2 border font-mono text-xs">{r.userId}</td>
                      <td className="p-2 border">{r.score ?? '-'}</td>
                      <td className="p-2 border">{r.max ?? '-'}</td>
                      <td className="p-2 border">{r.passed == null ? '-' : (r.passed ? 'Yes' : 'No')}</td>
                      <td className="p-2 border">{r.pct == null ? '-' : `${r.pct}%`}</td>
                      <td className="p-2 border">{r.topic ?? '-'}</td>
                      <td className="p-2 border">{r.at ? new Date(r.at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
