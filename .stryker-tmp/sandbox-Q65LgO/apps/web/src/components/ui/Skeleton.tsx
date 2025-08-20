// @ts-nocheck
export default function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line skeleton" />
      ))}
    </div>
  );
}


