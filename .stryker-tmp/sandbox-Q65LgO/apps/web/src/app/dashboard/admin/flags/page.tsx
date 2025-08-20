// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Flags from "@/app/labs/admin/flags/page";

export default async function AdminFlagsPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Feature flags">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Feature flags" }]} />
			<Flags />
		</section>
	);
}


