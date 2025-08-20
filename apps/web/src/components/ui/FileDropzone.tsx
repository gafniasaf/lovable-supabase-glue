"use client";
import React from "react";

type Props = {
  onFiles?: (files: File[]) => void;
  label?: string;
};

export default function FileDropzone({ onFiles, label = "Drop files here or click to upload" }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = React.useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    onFiles?.(files);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setHover(false);
    const files = Array.from(e.dataTransfer.files || []);
    onFiles?.(files);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={pick}
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      className={["border-2 border-dashed rounded p-4 text-center cursor-pointer", hover ? "bg-blue-50 border-blue-400" : "bg-white"].join(" ")}
      aria-label={label}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={onChange} />
      <div className="text-sm text-gray-700">{label}</div>
    </div>
  );
}


