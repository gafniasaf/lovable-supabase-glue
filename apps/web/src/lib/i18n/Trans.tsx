export default function Trans({ keyPath, fallback }: { keyPath: string; fallback?: string }) {
  return (fallback ?? keyPath) as any;
}
