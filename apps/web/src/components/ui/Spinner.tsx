export default function Spinner({ size = 16 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      className="animate-spin text-gray-400"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}


