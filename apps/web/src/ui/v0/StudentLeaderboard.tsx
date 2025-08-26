"use client";
import React from "react";

export type StudentLeaderboardProps = {
  header?: { title?: string };
  rows: Array<{ rank: number; name: string; xp: number }>;
};

export default function StudentLeaderboard({ header = { title: "Leaderboard" }, rows = [] }: StudentLeaderboardProps) {
  return (
    <section className="p-6 space-y-4" aria-label="Leaderboard">
      <h1 className="text-xl font-semibold">{header.title}</h1>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead><tr className="bg-muted/50"><th className="p-2 text-left">Rank</th><th className="p-2 text-left">Student</th><th className="p-2 text-right">XP</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank} className="border-b"><td className="p-2">{r.rank}</td><td className="p-2">{r.name}</td><td className="p-2 text-right">{r.xp}</td></tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-2 text-muted-foreground" colSpan={3}>No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
