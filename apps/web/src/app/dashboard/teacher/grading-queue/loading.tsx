export default function Loading() {
  const rows = Array.from({ length: 8 });
  return (
    <section className="p-6 space-y-4" aria-busy="true" aria-live="polite" aria-label="Grading queue loading">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Grading queue</h1>
        <span className="text-sm text-gray-400">Loading…</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-28 bg-gray-200 animate-pulse rounded" />
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2 border">Submission</th>
            <th className="p-2 border">Course</th>
            <th className="p-2 border">Student</th>
            <th className="p-2 border">Submitted</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((_, i) => (
            <tr key={i} className="border-b">
              <td className="p-2 border"><div className="h-4 w-40 bg-gray-200 animate-pulse rounded" /></td>
              <td className="p-2 border"><div className="h-4 w-32 bg-gray-200 animate-pulse rounded" /></td>
              <td className="p-2 border"><div className="h-4 w-32 bg-gray-200 animate-pulse rounded" /></td>
              <td className="p-2 border"><div className="h-4 w-36 bg-gray-200 animate-pulse rounded" /></td>
              <td className="p-2 border"><div className="h-6 w-16 bg-gray-200 animate-pulse rounded" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 items-center">
        <span className="underline text-sm pointer-events-none opacity-50" aria-disabled>Prev</span>
        <span className="text-xs text-gray-600">Page …</span>
        <span className="underline text-sm pointer-events-none opacity-50" aria-disabled>Next</span>
      </div>
    </section>
  );
}


