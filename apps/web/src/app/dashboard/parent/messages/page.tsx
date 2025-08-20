import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Inbox from "@/app/labs/system/inbox/page";

export default async function ParentMessagesPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Messages">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/parent" }, { label: "Messages" }]} />
			<Inbox />
		</section>
	);
}


