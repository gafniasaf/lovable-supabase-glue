"use client";
import React from "react";

export type StudentTimelineProps = {
  header?: { title?: string };
  rows: Array<{ courseId: string; days: number[]; total: number }>;
  totals: number[];
  grandTotal: number;
  csvHref: string;
};

export default function StudentTimeline({ header = { title: "Study timeline (7 days)" }, rows, totals, grandTotal, csvHref }: StudentTimelineProps) {
  return (
    <section className="p-6 space-y-3" aria-label="Timeline">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{header.title}</h1>
        <a className="underline" href={csvHref} download="study-timeline.csv" data-testid="timeline-csv-link">Download CSV</a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border" data-testid="timeline-table">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-2 text-left">Course</th>
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="border p-2 text-center">Day {i + 1}</th>
              ))}
              <th className="border p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.courseId} className="odd:bg-background even:bg-muted/30" data-testid="timeline-row">
                <td className="border p-2 font-mono" data-testid="cell-course-id">{r.courseId}</td>
                {r.days.map((v, i) => (
                  <td key={i} className="border p-2 text-center" data-testid={`cell-day-${i + 1}`}>{v}</td>
                ))}
                <td className="border p-2 text-right" data-testid="timeline-total-minutes">{r.total}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="border p-2 text-muted-foreground" colSpan={9}>No enrollments yet.</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-muted/50 font-medium">
              <td className="border p-2 text-right">Totals</td>
              {totals.map((v, i) => (
                <td key={i} className="border p-2 text-center">{v}</td>
              ))}
              <td className="border p-2 text-right">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
