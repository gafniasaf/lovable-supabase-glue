"use client";
import React, { useState } from "react";
import Link from "next/link";
import Trans from "@/lib/i18n/Trans";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import SmartLink from "@/app/components/SmartLinkClient";

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
							<SmartLink className="block underline" href="/dashboard/student" onClick={() => setOpen(false)} aria-label="Student dashboard"><Trans keyPath="nav.student.dashboard" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/notifications" onClick={() => setOpen(false)} aria-label="Notifications"><Trans keyPath="nav.notifications" /></SmartLink>
							<SmartLink className="block underline" href={{ pathname: "/dashboard/settings" }} onClick={() => setOpen(false)} aria-label="Settings"><Trans keyPath="nav.settings" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/student/plan" onClick={() => setOpen(false)} aria-label="Planner"><Trans keyPath="nav.student.plan" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/student/timeline" onClick={() => setOpen(false)} aria-label="Timeline"><Trans keyPath="nav.student.timeline" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/student/messages" onClick={() => setOpen(false)} aria-label="Messages"><Trans keyPath="nav.messages" /></SmartLink>
							<div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.teacher" /></div>
							<SmartLink className="block underline" href="/dashboard/teacher" onClick={() => setOpen(false)} aria-label="Teacher dashboard"><Trans keyPath="nav.teacher.dashboard" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/teacher/grading-queue" onClick={() => setOpen(false)} aria-label="Grading queue"><Trans keyPath="nav.teacher.gradingQueue" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/teacher/enrollments" onClick={() => setOpen(false)} aria-label="Enrollments"><Trans keyPath="nav.teacher.enrollments" /></SmartLink>
							<div className="text-xs text-gray-500 mt-3"><Trans keyPath="nav.groups.admin" /></div>
							<SmartLink className="block underline" href="/dashboard/admin" onClick={() => setOpen(false)} aria-label="Admin dashboard"><Trans keyPath="nav.admin.dashboard" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/admin/users" onClick={() => setOpen(false)} aria-label="Users"><Trans keyPath="nav.admin.users" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/admin/roles" onClick={() => setOpen(false)} aria-label="Roles"><Trans keyPath="nav.admin.roles" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/admin/flags" onClick={() => setOpen(false)} aria-label="Feature flags"><Trans keyPath="nav.admin.flags" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/admin/health" onClick={() => setOpen(false)} aria-label="System health"><Trans keyPath="nav.admin.health" /></SmartLink>
							<SmartLink className="block underline" href="/dashboard/admin/reports" onClick={() => setOpen(false)} aria-label="Reports"><Trans keyPath="nav.admin.reports" /></SmartLink>
							<div className="mt-3 pt-3 border-t">
								<div className="text-xs text-gray-500 mb-1"><Trans keyPath="common.language" fallback="Language" /></div>
								<LanguageSwitcher />
							</div>
						</nav>
					</div>
				</div>
			)}
		</>
	);
}


