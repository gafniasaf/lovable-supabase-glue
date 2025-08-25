"use client";
import React from "react";

export type QueueItem = {
  id: string;
  trainee: string;
  epa: string;
  submittedAt: string; // ISO or human string
  status: "pending" | "in-review" | "completed";
};

export type SupervisorQueueProps = {
  title?: string;
  items: QueueItem[];
  onSelect?: (id: string) => void;
  page?: number;
  pageCount?: number;
};

const statusBadge: Record<QueueItem["status"], string> = {
  pending: "bg-gray-100 text-gray-700",
  "in-review": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export default function SupervisorQueue({
  title = "Supervisor Queue",
  items,
  onSelect,
  page = 1,
  pageCount = 1,
}: SupervisorQueueProps) {
  return (
    <section
      aria-label="Supervisor queue"
      data-testid="supervisor-queue"
      className="max-w-5xl mx-auto"
    >
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2" aria-label="Toolbar">
          <label className="sr-only" htmlFor="queue-search">Search evaluations</label>
          <input
            id="queue-search"
            className="border rounded px-3 py-1.5 text-sm"
            placeholder="Search evaluations…"
            aria-describedby="queue-search-hint"
          />
          <span id="queue-search-hint" className="sr-only">Type to filter visible rows (presentation only)</span>
          <label className="sr-only" htmlFor="queue-status">Status</label>
          <select id="queue-status" className="border rounded px-2 py-1.5 text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </header>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th scope="col" className="text-left px-4 py-2 font-medium">Trainee</th>
              <th scope="col" className="text-left px-4 py-2 font-medium">EPA</th>
              <th scope="col" className="text-left px-4 py-2 font-medium">Submitted</th>
              <th scope="col" className="text-left px-4 py-2 font-medium">Status</th>
              <th scope="col" className="px-4 py-2"><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <span aria-hidden>📂</span>
                    <span>No evaluations in the queue.</span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{row.trainee}</td>
                  <td className="px-4 py-2">{row.epa}</td>
                  <td className="px-4 py-2">{row.submittedAt}</td>
                  <td className="px-4 py-2">
                    <span className={["inline-flex items-center rounded px-2 py-0.5 text-xs", statusBadge[row.status]].join(" ")}>
                      {row.status === "in-review" ? "In review" : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      className="underline text-sm"
                      onClick={() => onSelect?.(row.id)}
                      aria-label={`View evaluation ${row.id}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav className="mt-3 flex items-center justify-end gap-2" aria-label="Pagination">
        <button type="button" className="border rounded px-2 py-1 text-sm disabled:opacity-50" disabled={page <= 1} aria-label="Previous page">Previous</button>
        <span className="text-xs text-gray-600">Page {page} of {pageCount}</span>
        <button type="button" className="border rounded px-2 py-1 text-sm disabled:opacity-50" disabled={page >= pageCount} aria-label="Next page">Next</button>
      </nav>
    </section>
  );
}


