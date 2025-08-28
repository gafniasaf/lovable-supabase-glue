export default function TopNav({ left, right }: { left?: any; right?: any }) {
  return (
    <header className="flex items-center justify-between p-2 border-b bg-white/70">
      <div className="flex items-center gap-2">{left ?? null}</div>
      <div className="flex items-center gap-2">{right ?? null}</div>
    </header>
  ) as any;
}
