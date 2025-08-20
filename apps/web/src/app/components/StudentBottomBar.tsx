"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Trans from "@/lib/i18n/Trans";

export default function StudentBottomBar() {
	const path = usePathname();
	const isStudent = path?.startsWith('/dashboard/student');
	if (!isStudent) return null;
	const items: { href: string; labelKey: string }[] = [
		{ href: '/dashboard/student', labelKey: 'nav.student.dashboard' },
		{ href: '/dashboard/student/plan', labelKey: 'nav.student.plan' },
		{ href: '/dashboard/student/timeline', labelKey: 'nav.student.timeline' },
		{ href: '/dashboard/notifications', labelKey: 'nav.notifications' }
	];
	return (
		<nav className="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden" role="navigation" aria-label="Student tabs">
			<ul className="grid grid-cols-4 text-center text-xs">
				{items.map(it => (
					<li key={it.href}>
						<Link href={it.href as any} aria-current={path === it.href ? 'page' : undefined} className={["block py-2", path === it.href ? 'font-semibold' : 'text-gray-600'].join(' ')}><Trans keyPath={it.labelKey} /></Link>
					</li>
				))}
			</ul>
		</nav>
	);
}


