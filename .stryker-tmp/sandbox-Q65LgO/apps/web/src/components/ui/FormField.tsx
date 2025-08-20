// @ts-nocheck
import React from "react";

type Props = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export default function FormField({ label, htmlFor, hint, error, children }: Props) {
  const describedBy = [hint ? `${htmlFor}-hint` : null, error ? `${htmlFor}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="text-sm text-gray-700">{label}</label>
      <div aria-describedby={describedBy}>{children}</div>
      {hint ? <div id={`${htmlFor}-hint`} className="text-xs text-gray-500">{hint}</div> : null}
      {error ? <div id={`${htmlFor}-error`} className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}


