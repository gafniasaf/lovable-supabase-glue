// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Health from "@/app/labs/system/health/page";

export default async function AdminHealthPage() {
	return (
		<section className="p-6 space-y-4" aria-label="System health">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "System health" }]} />
			<Health />
		</section>
	);
}


