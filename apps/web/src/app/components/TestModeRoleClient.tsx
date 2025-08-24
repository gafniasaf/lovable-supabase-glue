"use client";
import { useEffect, useState } from "react";

const allowed = new Set(["teacher", "student", "parent", "admin"]);

export default function TestModeRoleClient() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = typeof document !== 'undefined' ? document.cookie || '' : '';
      for (const part of raw.split(';')) {
        const [k, ...v] = part.trim().split('=');
        if (k === 'x-test-auth') {
          const val = decodeURIComponent(v.join('='));
          if (allowed.has(val)) setRole(val);
          break;
        }
      }
    } catch {}
  }, []);
  if (!role) return null;
  return <p className="text-gray-500">Role: {role}</p>;
}


