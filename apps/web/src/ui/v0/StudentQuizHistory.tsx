"use client";
import React from "react";

export type StudentQuizHistoryProps = {
  header?: { title?: string };
  rows: Array<{ id: string; title: string; submittedAt?: string | null; score?: number | null }>;
  backHref?: string;
  state?: "default" | "loading" | "empty";
};

export default function StudentQuizHistory({ header = { title: "Quiz History" }, rows = [], backHref, state = "default" }: StudentQuizHistoryProps) {
  return (
    <section className="p-6 space-y-4" aria-label="Quiz history">
      <h1 className="text-xl font-semibold">{header.title}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border" data-testid="quiz-history-list">
          <thead>
            <tr className="bg-muted/50 text-left">
              <th className="p-2">Quiz</th>
              <th className="p-2">Submitted</th>
              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const hasSubmission = !!r.submittedAt;
              const scoreDisplay = r.score != null ? String(r.score) : (hasSubmission ? '0' : '-');
              return (
                <tr key={r.id} className="border-t" data-testid="history-row">
                  <td className="p-2" data-testid="history-quiz-title">{r.title}</td>
                  <td className="p-2">{r.submittedAt ?? '-'}</td>
                  <td className="p-2" data-testid="history-score">{scoreDisplay}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="p-2 text-muted-foreground" colSpan={3}>No quizzes yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {backHref && <a className="underline" href={backHref}>Back to course</a>}
    </section>
  );
}
