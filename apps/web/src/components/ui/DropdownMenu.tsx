"use client";
import React from "react";

type Item = { key: string; label: React.ReactNode; onSelect?: () => void };

export default function DropdownMenu({ label, items }: { label: React.ReactNode; items: Item[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (open && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      const focusable = Array.from((listRef.current || document).querySelectorAll<HTMLButtonElement>("[role='menuitem']"));
      const idx = focusable.indexOf(document.activeElement as HTMLButtonElement);
      if (e.key === 'Escape') { setOpen(false); (ref.current?.querySelector("button") as HTMLButtonElement | null)?.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); const next = focusable[Math.min((idx < 0 ? 0 : idx + 1), focusable.length - 1)]; next?.focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); const prev = focusable[Math.max((idx < 0 ? 0 : idx - 1), 0)]; prev?.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button" className="border rounded px-2 py-1 text-sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {label}
      </button>
      {open ? (
        <div role="menu" ref={listRef} className="absolute right-0 mt-1 min-w-40 border bg-white dark:bg-gray-900 shadow rounded text-sm py-1 z-50">
          {items.map((it) => (
            <button
              key={it.key}
              role="menuitem"
              className="px-3 py-1 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => {
                setOpen(false);
                it.onSelect?.();
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}


