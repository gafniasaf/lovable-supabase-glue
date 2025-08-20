// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { createFilesGateway } from "@/lib/data/files";

export function AnnouncementAttachment({ keyName }: { keyName: string }) {
  const [meta, setMeta] = useState<{ filename: string | null; content_type: string | null; url: string | null } | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const map = await createFilesGateway().resolve([keyName]);
        if (mounted) setMeta(map?.[keyName] || null);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [keyName]);
  const icon = !meta?.content_type ? '📎' : (meta.content_type.startsWith('image/') ? '🖼️' : (meta.content_type === 'application/pdf' ? '📄' : '📎'));
  const href = meta?.url || `/api/files/download-url?id=${encodeURIComponent(keyName)}`;
  return (
    <div className="mt-1 text-sm">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <a className="underline" href={href} target="_blank" rel="noreferrer">{meta?.filename || 'Attachment'}</a>
      </div>
      {meta?.content_type?.startsWith('image/') && meta?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meta.url} alt={meta.filename || 'attachment'} className="mt-1 max-h-32 rounded border" />
      ) : null}
    </div>
  );
}


