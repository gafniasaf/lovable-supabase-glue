"use client";
export default function SignOutClient({ action }: { action?: () => Promise<void> }) {
  return (<form action={action}><button type="submit" className="underline text-xs">Sign out</button></form>) as any;
}
