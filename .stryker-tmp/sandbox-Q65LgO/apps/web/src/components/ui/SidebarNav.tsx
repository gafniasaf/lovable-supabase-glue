// @ts-nocheck
import React from "react";

type Item = { href: string; label: string };

export default function SidebarNav({ items }: { items: Item[] }) {
  return (
    <nav className="space-y-2 text-sm">
      {items.map((it) => (
        <a key={it.href} href={it.href} className="block underline">{it.label}</a>
      ))}
    </nav>
  );
}


