"use client";
import React from "react";

export type UploadResult = { url: string; key?: string };
export type UploaderProps = {
  entity: "assessment" | "evaluation";
  id: string;
  allowed: string[];
  onUploaded?: (res: UploadResult) => void;
};

export function Uploader({ entity, id, allowed, onUploaded }: UploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string>("");

  async function onSelect(files: FileList | null) {
    setError("");
    setProgress(0);
    const file = files && files[0];
    if (!file) return;
    if (!allowed.includes(file.type)) {
      setError("File type not allowed");
      return;
    }
    try {
      const res = await fetch("/api/ef/files/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity, id, filename: file.name, contentType: file.type })
      } as any);
      if (!res.ok) throw new Error(await res.text());
      const { url, method = "PUT", headers = {} } = await res.json();
      await uploadWithProgress(url, method, headers, file);
      onUploaded?.({ url });
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    }
  }

  function uploadWithProgress(url: string, method: string, headers: Record<string, string>, file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      for (const [k, v] of Object.entries(headers || {})) xhr.setRequestHeader(k, v);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          setProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };
      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(); else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.send(file);
    });
  }

  return (
    <div data-testid="ef-upload">
      <input
        ref={inputRef}
        data-testid="ef-upload-input"
        type="file"
        onChange={(e) => onSelect(e.currentTarget.files)}
        aria-describedby={error ? "ef-upload-error" : undefined}
      />
      {progress > 0 && (
        <div data-testid="ef-upload-progress" aria-live="polite">{progress}%</div>
      )}
      {error && (
        <div id="ef-upload-error" role="alert" style={{ color: "#b00020" }}>{error}</div>
      )}
    </div>
  );
}


