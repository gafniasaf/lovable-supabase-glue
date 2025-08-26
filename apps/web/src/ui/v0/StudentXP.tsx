"use client";
import React from "react";

export type StudentXPProps = {
  header?: { title?: string };
  level?: string | number;
  percent?: number; // 0..100
};

export default function StudentXP({ header = { title: "XP" }, level = '—', percent = 40 }: StudentXPProps) {
  return (
    <section className="p-6 space-y-4" aria-label="XP">
      <h1 className="text-xl font-semibold">{header.title}</h1>
      <div className="border rounded p-4">
        <div className="text-sm text-muted-foreground">Level</div>
        <div className="text-2xl font-semibold">{level}</div>
        <div className="mt-2 h-2 bg-muted rounded"><div className="h-2 bg-primary rounded" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>
      </div>
    </section>
  );
}
