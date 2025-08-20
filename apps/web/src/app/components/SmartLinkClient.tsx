"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";

export default function SmartLinkClient(props: React.ComponentProps<typeof Link>) {
  const slow = typeof window !== 'undefined' && (window as any).__PREFETCH_SLOW__ === true;
  const { prefetch, href, ...rest } = props as any;
  const ref = useRef<HTMLAnchorElement | null>(null);
  const computedPrefetch = typeof prefetch === 'boolean' ? prefetch : !slow;

  useEffect(() => {
    if (slow) return; // don't attach observers on slow networks
    const el = ref.current;
    if (!el) return;
    let cleanupHover = () => {};
    let cleanupIO = () => {};
    try {
      const onEnter = () => {
        try { (Link as any).prefetch?.(typeof href === 'string' ? href : href?.pathname || href?.toString?.()); } catch {}
      };
      const onMouse = () => onEnter();
      el.addEventListener('mouseenter', onMouse);
      cleanupHover = () => el.removeEventListener('mouseenter', onMouse);
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { onEnter(); io.disconnect(); break; }
        }
      }, { rootMargin: '200px' });
      io.observe(el);
      cleanupIO = () => io.disconnect();
    } catch {}
    return () => { try { cleanupHover(); cleanupIO(); } catch {} };
  }, [href, slow]);

  return <Link ref={ref as any} href={href} {...(rest as any)} prefetch={computedPrefetch} />;
}


