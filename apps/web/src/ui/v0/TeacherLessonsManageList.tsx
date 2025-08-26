"use client";
import React from "react";

export type TeacherLessonsManageListProps = {
  header?: { title?: string };
  items: Array<{
    id: string;
    order: number;
    title: string;
    attachmentHref?: string | null;
    deleteAttachmentHref?: string | null;
  }>;
  backHref?: string;
  state?: "default" | "loading" | "empty";
};

export default function TeacherLessonsManageList({ header = { title: "Manage lessons" }, items = [], backHref, state = "default" }: TeacherLessonsManageListProps) {
  if (state === "loading") {
    return (
      <section className="p-6 space-y-4">
        <div className="h-8 w-56 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-card rounded border animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">{header.title}</h1>
        <div className="text-muted-foreground">No lessons yet.</div>
        {backHref && <a className="underline" href={backHref}>Back</a>}
      </section>
    );
  }

  return (
    <section className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{header.title}</h1>
        {backHref && <a className="underline" href={backHref}>Back</a>}
      </div>
      <div className="bg-card rounded border divide-y">
        {items.map((l) => (
          <div key={l.id} className="p-3">
            <div className="font-medium">#{l.order} — {l.title}</div>
            {l.attachmentHref ? (
              <div className="mt-1 text-sm flex items-center gap-2">
                <a className="underline" href={l.attachmentHref} target="_blank" rel="noreferrer">Attachment</a>
                {l.deleteAttachmentHref && (
                  <form action={l.deleteAttachmentHref} method="post">
                    <input type="hidden" name="_method" value="DELETE" />
                    <button className="underline text-xs" type="submit">Delete</button>
                  </form>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No attachment</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
