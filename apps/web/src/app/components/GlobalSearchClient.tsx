"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";

type Command = { id: string; label: string; href: string };

export default function GlobalSearchClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const commands: Command[] = useMemo(() => ([
    { id: 'student-dashboard', label: t('nav.student.dashboard'), href: '/dashboard/student' },
    { id: 'teacher-dashboard', label: t('nav.teacher.dashboard'), href: '/dashboard/teacher' },
    { id: 'admin-dashboard', label: t('nav.admin.dashboard'), href: '/dashboard/admin' },
    { id: 'notifications', label: t('nav.notifications'), href: '/dashboard/notifications' },
    { id: 'settings', label: t('nav.settings'), href: '/dashboard/settings' },
    { id: 'grading-queue', label: t('nav.teacher.gradingQueue'), href: '/dashboard/teacher/grading-queue' },
    { id: 'admin-users', label: t('nav.admin.users'), href: '/dashboard/admin/users' },
    { id: 'admin-reports', label: t('nav.admin.reports'), href: '/dashboard/admin/reports' }
  ]), [t]);

  const list = useMemo(() => (
    commands.filter(c => c.label.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
  ), [commands, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative w-full" role="search">
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder={t('common.search', 'Search...')}
        className="w-full border rounded px-3 py-1.5 text-sm dark:bg-gray-800 dark:text-gray-100"
        aria-label={t('common.search', 'Search')}
      />
      {open && list.length > 0 && (
        <div className="absolute mt-1 left-0 right-0 bg-white dark:bg-gray-900 border rounded shadow z-50" role="listbox">
          {list.map(item => (
            <button
              key={item.id}
              role="option"
              aria-selected="false"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setOpen(false); router.push(item.href as any); }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


