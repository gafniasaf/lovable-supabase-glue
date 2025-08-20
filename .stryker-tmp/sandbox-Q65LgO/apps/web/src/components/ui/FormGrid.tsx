// @ts-nocheck
import React from "react";

export default function FormGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 1 | 2 | 3 | 4 }) {
  const grid = columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1';
  return <div className={["grid gap-4", grid].join(" ")}>{children}</div>;
}


