"use client";
import { useEffect } from "react";

export default function GradingHotkeysClient() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented) return;
      const key = e.key.toLowerCase();
      if (key === 'n') {
        const btn = document.querySelector('[data-testid="grade-next"]') as HTMLButtonElement | null;
        btn?.click();
      } else if (key === 'p') {
        try { history.back(); } catch {}
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}


