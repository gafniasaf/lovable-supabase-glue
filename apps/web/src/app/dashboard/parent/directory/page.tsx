import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Directory from "@/app/labs/parent/children-directory/page";

export default async function ParentDirectoryPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Children directory">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/parent" }, { label: "Directory" }]} />
			<Directory />
		</section>
	);
}


