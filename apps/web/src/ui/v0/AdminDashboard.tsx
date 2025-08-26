"use client";
import React from "react";

export type AdminDashboardProps = {
  header?: { title?: string };
  kpis: Array<{ id: string; label: string; value: number }>;
  sections: Array<{ id: string; title: string; links: Array<{ label: string; href: string }> }>;
  recent?: Array<{ id: string; message: string; at: string }>;
};

export default function AdminDashboard({ header = { title: "Admin dashboard" }, kpis = [], sections = [], recent = [] }: AdminDashboardProps) {
  return (
    <section className="p-6 space-y-4" aria-label="Admin dashboard">
      <h1 className="text-2xl font-semibold">{header.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="admin-kpis">
        {kpis.map((k) => (
          <div key={k.id} className="border rounded p-4">
            <div className="text-sm text-muted-foreground">{k.label}</div>
            <div className="text-2xl font-semibold">{k.value}</div>
          </div>
        ))}
        {kpis.length === 0 && (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded p-4">
              <div className="skeleton h-4 w-24 mb-2" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))
        )}
      </div>
      {sections.map((s) => (
        <section key={s.id} className="border rounded p-4">
          <h2 className="font-medium mb-2">{s.title}</h2>
          <ul className="list-disc ml-6 text-sm">
            {s.links.map((l, i) => (
              <li key={i}><a className="underline" href={l.href}>{l.label}</a></li>
            ))}
          </ul>
        </section>
      ))}
      {recent.length > 0 && (
        <section className="border rounded p-4">
          <h2 className="font-medium mb-2">Recent activity</h2>
          <ul className="text-sm space-y-1">
            {recent.slice(0,10).map((a) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>{a.message}</span>
                <span className="text-muted-foreground">{new Date(a.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="border rounded p-4" data-testid="admin-metrics">
        <div className="text-muted-foreground">Metrics coming soon…</div>
      </section>
    </section>
  );
}
