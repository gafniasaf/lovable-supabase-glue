"use client";

import React from "react";

export function AssignmentsList() {
  const [q, setQ] = React.useState('');
  const rows = [
    { title: 'Algebra Basics', due: '2025-09-01' },
    { title: 'Calculus Intro', due: '2025-09-05' },
  ];
  const filtered = rows.filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <h2>All Assignments</h2>
      <input
        placeholder="Search assignments"
        aria-label="Search assignments"
        className="border rounded px-3 py-1 text-sm mt-2"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <table role="table" className="mt-3 w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Title</th>
            <th className="text-left">Due</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.title}>
              <td>{r.title}</td>
              <td>{r.due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}


