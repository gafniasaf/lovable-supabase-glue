import React from "react";

type Item = { href: string; label: string; icon?: string };

export default function SidebarNav({ items, current }: { items: Item[]; current: string }) {
  return (
    <nav className="space-y-1 text-sm">
      {items.map((it) => {
        const isActive = current === it.href || current.startsWith(`${it.href}/`);
        const base = "block rounded px-2 py-1";
        const cls = isActive ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700 hover:bg-gray-50";
        return (
          <a key={it.href} href={it.href} className={[base, cls].join(" ")}
             aria-current={isActive ? 'page' : undefined}>
            {it.icon ? <span aria-hidden className="mr-2">{it.icon}</span> : null}{it.label}
          </a>
        );
      })}
    </nav>
  );
}


