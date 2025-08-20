import React from "react";

export default function TopNav({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="px-4 py-2 border-b text-sm text-gray-700 flex items-center justify-between">
      <div className="flex items-center gap-3">{left}</div>
      <div className="flex items-center gap-4">{right}</div>
    </header>
  );
}


