"use client";
export default function NotificationsDropdownClient({ initial }: { initial?: any[] }) {
  const list = Array.isArray(initial) ? initial : [];
  return (
    <ul>
      {list.slice(0, 5).map((n: any) => (
        <li key={n.id || Math.random()}>{n.type || 'notification'}</li>
      ))}
      {list.length === 0 ? <li className="text-gray-500">No notifications</li> : null}
    </ul>
  ) as any;
}
