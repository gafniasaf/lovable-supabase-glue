"use client";

import React from "react";

const DEMO_DATA = [
  { title: 'Calculus', teacher: 'John Smith' },
  { title: 'Algebra', teacher: 'Jane Doe' },
  { title: 'Math Theory', teacher: 'Alan T' },
  { title: 'Biology', teacher: 'M Curie' },
  { title: 'Zoology', teacher: 'C Darwin' },
];

export function CoursesList() {
  const [sortAsc, setSortAsc] = React.useState<boolean | null>(null);
  const data = DEMO_DATA;
  const [page, setPage] = React.useState(0);
  const pageSize = 2;
  const sorted = React.useMemo(() => {
    const copy = [...data];
    if (sortAsc !== null) copy.sort((a, b) => a.title.localeCompare(b.title));
    return sortAsc ? copy : sortAsc === false ? copy.reverse() : copy;
  }, [sortAsc, data]);
  const pageCount = Math.ceil(sorted.length / pageSize);
  const rows = React.useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  return (
    <section>
      <h2>All Courses</h2>
      <table role="table" className="mt-3 w-full text-sm">
        <thead>
          <tr>
            <th
              className="text-left cursor-pointer select-none"
              onClick={() => setSortAsc(sortAsc === null ? true : !sortAsc)}
              aria-sort={sortAsc === null ? 'none' : sortAsc ? 'ascending' : 'descending'}
            >
              Course
            </th>
            <th className="text-left">Teacher</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.title}>
              <td>{r.title}</td>
              <td>{r.teacher}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2">
        <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</button>
        <span>Page {page + 1} / {pageCount}</span>
        <button disabled={page + 1 >= pageCount} onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}>Next</button>
      </div>
    </section>
  );
}


