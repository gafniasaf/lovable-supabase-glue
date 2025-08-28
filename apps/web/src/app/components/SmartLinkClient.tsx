"use client";
export default function SmartLink({ href, children }: { href: string; children?: any }) {
  return (<a href={href}>{children ?? href}</a>) as any;
}
