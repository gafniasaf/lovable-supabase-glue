// @ts-nocheck
"use client";
import React, { useState } from "react";
import Link from "next/link";
import Trans from "@/lib/i18n/Trans";

export default function MobileNav() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<button className="md:hidden underline text-xs" onClick={() => setOpen(true)} aria-label="Open navigation"><Trans keyPath="common.menu" /></button>
			{open && (
				<div className="fixed inset-0 z-[1100]">
					<div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
					<div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-lg p-3 overflow-auto" role="dialog" aria-modal="true" aria-label="Navigation">
						<div className="flex items-center justify-between mb-2">
							<div className="font-medium"><Trans keyPath="common.navigation" /></div>
							<button className="underline text-xs" onClick={() => setOpen(false)} aria-label="Close"><Trans keyPath="common.close" /></button>
						</div>
						<nav className="space-y-2 text-sm">
							<div className="text-xs text-gray-500"><Trans keyPath="nav.groups.student" /></div>
							<Link className="block underline" href="/dashboard/student" onClick={() => setOpen(false)}><Trans keyPath="nav.student.dashboard" /></Link>
							<Link className="block underline" href="/dashboard/notifications" onClick={() => setOpen(false)}><Trans keyPath="nav.notifications" /></Link>
							<Link className="block underline" href={{ pathname: "/dashboard/settings" }} onClick={() => setOpen(false)}><Trans keyPath="nav.settings" /></Link>
							<Link className="block underline" href="/dashboard/student/plan" onClick={() => setOpen(false)}><Trans keyPath="nav.student.plan" /></Link>
							<Link className="block underline" href="/dashboard/student/timeline" onClick={() => setOpen(false)}><Trans keyPath="nav.student.timeline" /></Link>
							<Link className="block underline" href="/dashboard/student/messages" onClick={() => setOpen(false)}><Trans keyPath="nav.messages" /></Link>
							<div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.teacher" /></div>
							<Link className="block underline" href="/dashboard/teacher" onClick={() => setOpen(false)}><Trans keyPath="nav.teacher.dashboard" /></Link>
							<Link className="block underline" href="/dashboard/teacher/grading-queue" onClick={() => setOpen(false)}><Trans keyPath="nav.teacher.gradingQueue" /></Link>
							<Link className="block underline" href="/dashboard/teacher/enrollments" onClick={() => setOpen(false)}><Trans keyPath="nav.teacher.enrollments" /></Link>
							<div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.admin" /></div>
							<Link className="block underline" href="/dashboard/admin" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.dashboard" /></Link>
							<Link className="block underline" href="/dashboard/admin/users" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.users" /></Link>
							<Link className="block underline" href="/dashboard/admin/roles" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.roles" /></Link>
							<Link className="block underline" href="/dashboard/admin/flags" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.flags" /></Link>
							<Link className="block underline" href="/dashboard/admin/health" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.health" /></Link>
							<Link className="block underline" href="/dashboard/admin/reports" onClick={() => setOpen(false)}><Trans keyPath="nav.admin.reports" /></Link>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}


