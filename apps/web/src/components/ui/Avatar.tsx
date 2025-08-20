type AvatarProps = {
  name?: string;
  src?: string | null;
  size?: number;
  className?: string;
};

export default function Avatar({ name = "?", src = null, size = 32, className = "" }: AvatarProps) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "?";
  const s = { width: size, height: size } as const;
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 text-xs font-medium ${className}`}
      style={s}
      role="img"
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover rounded-full" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </div>
  );
}


