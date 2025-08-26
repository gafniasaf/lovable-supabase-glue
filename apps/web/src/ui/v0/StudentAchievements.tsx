"use client";
import React from "react";

export type StudentAchievementsProps = {
  header?: { title?: string };
  items: Array<{ id: string | number; label: string; icon?: string }>;
};

export default function StudentAchievements({ header = { title: "Achievements" }, items = [] }: StudentAchievementsProps) {
  return (
    <section className="p-6 space-y-4" aria-label="Achievements">
      <h1 className="text-xl font-semibold">{header.title}</h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <li key={it.id} className="border rounded p-4 text-center text-sm">{it.icon || '🏅'} {it.label}</li>
        ))}
        {items.length === 0 && (
          <li className="text-muted-foreground">No achievements yet.</li>
        )}
      </ul>
    </section>
  );
}
