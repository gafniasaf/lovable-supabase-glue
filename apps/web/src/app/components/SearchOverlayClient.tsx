"use client";
import React, { useState } from "react";
import GlobalSearchClient from "@/app/components/GlobalSearchClient";

export default function SearchOverlayClient() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="underline text-xs"
        aria-label="Open search"
        onClick={() => setOpen(true)}
      >
        🔎 Search
      </button>
      {open && (
        <div className="fixed inset-0 z-[1200]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 bg-white dark:bg-gray-900 shadow-lg p-3" role="dialog" aria-modal="true" aria-label="Search">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Search</div>
              <button className="underline text-xs" onClick={() => setOpen(false)} aria-label="Close">Close</button>
            </div>
            <GlobalSearchClient />
          </div>
        </div>
      )}
    </>
  );
}


