"use client";
import React from "react";

export type TeacherAnalyticsProps = {
  header?: { title?: string; subtitle?: string };
  metrics: Array<{ id: string; label: string; value: string | number }>;
  distribution?: Array<{ bucket: string; count: number }>;
  exportHref?: string;
  state?: "default" | "loading" | "empty";
};

export default function TeacherAnalytics({ header = { title: "Course analytics" }, metrics = [], distribution = [], exportHref, state = "default" }: TeacherAnalyticsProps) {
  if (state === "loading") {
    return (
      <section className="p-6 space-y-4">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-card rounded border animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-card rounded border animate-pulse" />
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
        <div className="text-muted-foreground">No analytics data available.</div>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
        {header.subtitle && <p className="text-muted-foreground">{header.subtitle}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="border rounded p-4 bg-card">
            <div className="text-sm text-muted-foreground">{m.label}</div>
            <div className="text-2xl font-semibold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>
      {exportHref && (
        <div className="text-sm">
          <a className="underline" href={exportHref}>Download grade distribution CSV</a>
        </div>
      )}
      {distribution.length > 0 && (
        <section>
          <h2 className="font-medium mt-4">Grade distribution</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border mt-2">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="p-2 border">Bucket</th>
                  <th className="p-2 border">Count</th>
                </tr>
              </thead>
              <tbody>
                {distribution.slice(0, 100).map((b, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 border">{b.bucket}</td>
                    <td className="p-2 border">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <p className="text-muted-foreground">Light analytics wired to API.</p>
    </section>
  );
}
