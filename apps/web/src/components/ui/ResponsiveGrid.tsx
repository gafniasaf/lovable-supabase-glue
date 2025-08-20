import React from "react";

export default function ResponsiveGrid({ children, min = 250 }: { children: React.ReactNode; min?: number }) {
  return <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` }}>{children}</div>;
}


