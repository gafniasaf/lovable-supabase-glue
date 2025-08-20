// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import { createRuntimeGateway } from "@/lib/data/runtime";

type Props = { courseId: string; src: string; allowedOrigin: string };

export default function InteractiveEmbedClient({ courseId, src, allowedOrigin }: Props) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const tokenRef = useRef<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastCheckpointAt, setLastCheckpointAt] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Extract token from src
    try {
      const u = new URL(src, window.location.origin);
      tokenRef.current = u.searchParams.get('token');
    } catch {}
    // Attempt Runtime v2 token exchange and send token to iframe so the course can call context/progress/grade directly
    (async () => {
      try {
        if (tokenRef.current && frameRef.current && allowedOrigin) {
          const j = await createRuntimeGateway().exchange(tokenRef.current);
          const rt = (j as any)?.runtimeToken as string | undefined;
          const expiresAt = (j as any)?.expiresAt as string | undefined;
          if (rt) {
            frameRef.current.contentWindow?.postMessage({ type: 'runtime.token', runtimeToken: rt, expiresAt }, allowedOrigin);
            setConnected(true);
          }
        }
      } catch {}
    })();
    // Loading watchdog: if iframe doesn't load within 8s show a hint
    const timeout = window.setTimeout(() => { setLoading(false); if (!connected) setLoadError('Content is taking longer than expected to load.'); }, 8000);
    const handler = async (evt: MessageEvent) => {
      if (!evt || typeof evt.data !== "object") return;
      if (!evt.origin || evt.origin !== allowedOrigin) return;
      const data = evt.data as any;
      if (!data || typeof data.type !== "string") return;
      try {
        // Prefer Runtime v2 when enabled: provider posts directly to platform using bearer runtime token
        // Fallback to legacy events for MVP if route exists
        await createRuntimeGateway().postEvent({ courseId, event: data, token: tokenRef.current });
        if (data.type === 'checkpoint.save') setLastCheckpointAt(new Date().toISOString());
        if (data.type === 'ready' || data.type === 'heartbeat') setConnected(true);
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => { window.removeEventListener('message', handler); window.clearTimeout(timeout); };
  }, [courseId, allowedOrigin, src]);

  return (
    <section className="border rounded">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-600 border-b">
        <div className="flex items-center gap-2">
          <span className={["inline-block w-2 h-2 rounded-full", connected ? 'bg-green-500' : 'bg-gray-300'].join(' ')} aria-label={connected ? 'Connected' : 'Disconnected'} />
          <span>{connected ? 'Connected' : 'Connecting…'}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastCheckpointAt ? <span>Checkpoint: {new Date(lastCheckpointAt).toLocaleTimeString()}</span> : null}
          <button
            className="underline"
            onClick={() => {
              try { frameRef.current?.contentWindow?.postMessage({ type: 'checkpoint.load' }, allowedOrigin); } catch {}
            }}
          >Resume</button>
        </div>
      </div>
      {loadError ? (
        <div className="p-4 text-sm text-yellow-800 bg-yellow-50">{loadError}</div>
      ) : null}
      <iframe ref={frameRef} src={src} className="w-full h-[480px]" sandbox="allow-scripts allow-forms allow-pointer-lock allow-same-origin" />
    </section>
  );
}


