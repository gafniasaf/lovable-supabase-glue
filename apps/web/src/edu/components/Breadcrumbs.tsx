"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname() || '';
  const parts = pathname.split('/').filter(Boolean);
  const items = parts.slice(1); // drop leading 'edu'

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-1">
        {items.map((p, i) => (
          <li key={i} className="capitalize">{p}</li>
        ))}
      </ol>
    </nav>
  );
}


