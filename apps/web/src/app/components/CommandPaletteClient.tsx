"use client";
import React from "react";

type Item = { label: string; href: string; group?: string };

const DEFAULT_ITEMS: Item[] = [
  { label: "Student Dashboard", href: "/dashboard/student", group: "Dashboards" },
  { label: "Teacher Dashboard", href: "/dashboard/teacher", group: "Dashboards" },
  { label: "Admin Dashboard", href: "/dashboard/admin", group: "Dashboards" },
  { label: "Grading Queue", href: "/dashboard/teacher/grading-queue", group: "Teacher" },
  { label: "Notifications", href: "/dashboard/notifications", group: "Student" },
  { label: "Settings", href: "/dashboard/settings", group: "All" },
  { label: "Providers", href: "/dashboard/admin/providers", group: "Admin" },
  { label: "Catalog", href: "/dashboard/admin/catalog", group: "Admin" },
];

export default function CommandPaletteClient() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_ITEMS;
    return DEFAULT_ITEMS.filter(i => i.label.toLowerCase().includes(q) || i.group?.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal aria-label="Command palette">
      <div className="absolute inset-0 bg-black/40" role="button" tabIndex={0} aria-label="Close" onClick={() => setOpen(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(false); }} />
      <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[90%] max-w-xl bg-white text-black rounded shadow border">
        <div className="p-2 border-b">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search… (esc to close)"
            className="w-full p-2 outline-none"
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          />
        </div>
        <ul className="max-h-80 overflow-auto">
          {items.length === 0 ? (
            <li className="p-3 text-sm text-gray-600">No matches</li>
          ) : items.map((it, idx) => (
            <li key={idx} className="border-t">
              <a className="block p-3 hover:bg-gray-50" href={it.href} onClick={() => setOpen(false)}>
                <div className="text-sm font-medium">{it.label}</div>
                {it.group ? <div className="text-xs text-gray-500">{it.group}</div> : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


