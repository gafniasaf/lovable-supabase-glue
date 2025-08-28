"use client";
export default function NotificationsBellClient({ initialUnread }: { initialUnread?: number }) {
  return (<span aria-label="Notifications">🔔{initialUnread ? ` (${initialUnread})` : ''}</span>) as any;
}
