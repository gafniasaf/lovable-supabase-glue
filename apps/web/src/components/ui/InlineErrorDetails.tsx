"use client";
import React from "react";

export default function InlineErrorDetails({
  message = "Something went wrong.",
  details,
  requestId,
}: {
  message?: string;
  details?: string | null;
  requestId?: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border rounded p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium">{message}</div>
          {requestId ? (
            <div className="text-xs opacity-80">Request ID: {requestId}</div>
          ) : null}
        </div>
        {(details || requestId) ? (
          <button className="underline text-sm" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="error-details">
            {open ? 'Hide details' : 'Show details'}
          </button>
        ) : null}
      </div>
      {open ? (
        <pre id="error-details" className="mt-2 text-xs whitespace-pre-wrap max-h-60 overflow-auto bg-white/70 dark:bg-gray-800/50 p-2 rounded border">
{(details || '').slice(0, 4000)}
        </pre>
      ) : null}
    </div>
  );
}


