"use client";
import React, { useEffect } from "react";

export default function PrefetchClient() {
  useEffect(() => {
    try {
      const nav = (navigator as any);
      const saveData = !!nav?.connection?.saveData;
      const type = nav?.connection?.effectiveType || '';
      const slow = saveData || /(^|\b)(2g|slow-2g|3g)($|\b)/i.test(type);
      (window as any).__PREFETCH_SLOW__ = !!slow;
    } catch {}
  }, []);
  return null;
}


