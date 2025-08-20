// @ts-nocheck
import "../styles/globals.css";
import type { Metadata } from "next";
import { logout } from "./actions/logout";
import SignOutClient from "@/app/components/SignOutClient";
import NotificationsDropdownClient from "@/app/components/NotificationsDropdownClient";
import NotificationsBellClient from "@/app/components/NotificationsBellClient";
import { Suspense } from "react";
import { createNotificationsGateway } from "@/lib/data/notifications";
import Link from "next/link";
import ToastMount from "@/app/components/ToastMount";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import StudentBottomBar from "@/app/components/StudentBottomBar";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import I18nProvider from "@/lib/i18n/I18nProvider";
import MobileNav from "@/app/components/MobileNav";
import Trans from "@/lib/i18n/Trans";

export const metadata: Metadata = {
  title: "Education Platform v2",
  description: "MVP-first education platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Start background jobs (no-op unless enabled)
  try { require('@/server/scheduler').ensureJobsStarted?.(); } catch {}
  let nonce: string | undefined = undefined;
  try { nonce = (require('@/lib/csp').getCspNonce?.() as string | null) || undefined; } catch {}
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-yellow-200 text-black px-2 py-1 rounded" aria-label="Skip to main content"><Trans keyPath="common.skipToMain" fallback="Skip to main" /></a>
        <header className="px-4 py-2 border-b text-sm text-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="font-medium" aria-label="Dashboard home">Education Platform v2</a>
            <span className="text-gray-400">·</span>
            <a href="/" className="underline" aria-label="Home"><Trans keyPath="header.home" /></a>
          </div>
          <div className="flex items-center gap-4">
            <MobileNav />
            <RoleSwitcher />
            <LanguageSwitcher />
            <DarkModeToggle />
            <Suspense fallback={<span className="text-xs">🔔</span>}><NotificationsBell /></Suspense>
            <WhoAmI />
          </div>
        </header>
        <div className="flex min-h-[calc(100vh-41px)]">
          <aside className="hidden md:block w-60 border-r p-3 text-sm" aria-label="Primary">
            <nav className="space-y-2">
              <Link className="block underline" href="/dashboard" aria-label="Dashboard home"><Trans keyPath="header.home" /></Link>
              <div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.student" /></div>
              <Link className="block underline" href="/dashboard/student" aria-label="Student dashboard"><Trans keyPath="nav.student.dashboard" /></Link>
              <Link className="block underline" href="/dashboard/notifications" aria-label="Notifications"><Trans keyPath="nav.notifications" /></Link>
              <Link className="block underline" href={{ pathname: "/dashboard/settings" }} aria-label="Settings"><Trans keyPath="nav.settings" /></Link>
              <Link className="block underline" href="/dashboard/student/plan" aria-label="Planner"><Trans keyPath="nav.student.plan" /></Link>
              <Link className="block underline" href="/dashboard/student/timeline" aria-label="Timeline"><Trans keyPath="nav.student.timeline" /></Link>
              <Link className="block underline" href="/dashboard/student/messages" aria-label="Messages"><Trans keyPath="nav.messages" /></Link>
              <div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.teacher" /></div>
              <Link className="block underline" href="/dashboard/teacher" aria-label="Teacher dashboard"><Trans keyPath="nav.teacher.dashboard" /></Link>
              <Link className="block underline" href="/dashboard/teacher/grading-queue" aria-label="Grading queue"><Trans keyPath="nav.teacher.gradingQueue" /></Link>
              <Link className="block underline" href="/dashboard/teacher/enrollments" aria-label="Enrollments"><Trans keyPath="nav.teacher.enrollments" /></Link>
              <div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.admin" /></div>
              <Link className="block underline" href="/dashboard/admin" aria-label="Admin dashboard"><Trans keyPath="nav.admin.dashboard" /></Link>
              <Link className="block underline" href="/dashboard/admin/users" aria-label="Users"><Trans keyPath="nav.admin.users" /></Link>
              <Link className="block underline" href="/dashboard/admin/roles" aria-label="Roles"><Trans keyPath="nav.admin.roles" /></Link>
              <Link className="block underline" href="/dashboard/admin/flags" aria-label="Feature flags"><Trans keyPath="nav.admin.flags" /></Link>
              <Link className="block underline" href="/dashboard/admin/health" aria-label="System health"><Trans keyPath="nav.admin.health" /></Link>
              <Link className="block underline" href="/dashboard/admin/reports" aria-label="Reports"><Trans keyPath="nav.admin.reports" /></Link>
              <Link className="block underline" href="/dashboard/admin/parent-links" aria-label="Parent links"><Trans keyPath="nav.admin.parentLinks" /></Link>
              <Link className="block underline" href="/dashboard/admin/audit" aria-label="Audit logs"><Trans keyPath="nav.admin.audit" /></Link>
              <Link className="block underline" href="/dashboard/admin/providers" aria-label="Providers"><Trans keyPath="nav.admin.providers" /></Link>
              <Link className="block underline" href="/dashboard/admin/catalog" aria-label="Catalog"><Trans keyPath="nav.admin.catalog" /></Link>
            </nav>
          </aside>
          <main id="main" className="flex-1 p-4" tabIndex={-1} aria-label="Main content">
            {children}
          </main>
        </div>
        <ToastMount />
        <StudentBottomBar />
        </I18nProvider>
        {nonce ? (<script nonce={nonce} dangerouslySetInnerHTML={{ __html: 'window.__APP_LOADED__=true' }} />) : null}
      </body>
    </html>
  );
}

async function WhoAmI() {
  // Read role directly from cookies/headers to avoid any cache or propagation issues in tests
  const nh: any = await import('next/headers');
  let role: string | null = null;
  try {
    const c = nh.cookies();
    const h = nh.headers();
    const justLoggedOut = c.get('just-logged-out')?.value === '1';
    if (!justLoggedOut) {
      const val = c.get('x-test-auth')?.value ?? h.get('x-test-auth') ?? undefined;
      if (val === 'teacher' || val === 'student' || val === 'parent' || val === 'admin') role = val;
    }
  } catch {}
  return (
    <div className="flex items-center gap-3">
      <span data-testid="whoami-role">{role ?? 'anonymous'}</span>
      <SignOutClient action={logout} />
    </div>
  );
}

async function NotificationsBell() {
  const list = await createNotificationsGateway().list(0, 20).catch(() => [] as any[]);
  return (
    <div className="relative" data-testid="notif-bell">
      <details className="inline-block">
        <summary className="list-none cursor-pointer inline-flex items-center gap-1" aria-label="Notifications menu" title="Notifications">
          <NotificationsBellClient initialUnread={Array.isArray(list) ? list.filter((n: any) => !n.read_at).length : 0} />
        </summary>
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto border bg-white shadow p-2 text-sm">
          <NotificationsDropdownClient initial={Array.isArray(list) ? list : []} />
          <div className="mt-2"><a className="underline" href="/dashboard/notifications"><Trans keyPath="common.openInbox" fallback="Open inbox" /></a></div>
        </div>
      </details>
    </div>
  );
}

async function RoleSwitcher() {
  const { serverFetch } = await import("@/lib/serverFetch");
  const res = await serverFetch(`/api/health`, { cache: 'no-store' });
  const data = await res.json().catch(() => ({} as any));
  const role = (data?.testRole as string | null) || null;
  return (
    <form action="/api/test/switch-role" method="post" className="flex items-center gap-2">
      <label htmlFor="role-select" className="text-xs text-gray-500"><Trans keyPath="common.role" /></label>
      <select id="role-select" name="role" defaultValue={role || ''} className="border rounded p-1 text-xs">
        <option value="">anon</option>
        <option value="teacher">teacher</option>
        <option value="student">student</option>
        <option value="parent">parent</option>
        <option value="admin">admin</option>
      </select>
      <button className="underline text-xs" title="Apply role"><Trans keyPath="common.apply" /></button>
      <a className="underline text-xs" href="/api/test/seed?hard=1" title="Seed demo data"><Trans keyPath="common.seed" /></a>
    </form>
  );
}


