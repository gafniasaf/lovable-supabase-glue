// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Inbox from "@/app/labs/system/inbox/page";
import Trans from "@/lib/i18n/Trans";

export default async function TeacherMessagesPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Messages">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Messages" }]} />
			{/* Reuse labs inbox UI for now */}
			<Inbox />
		</section>
	);
}


