// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Roles from "@/app/labs/admin/roles/page";

export default async function AdminRolesPageProd() {
	return (
		<section className="p-6 space-y-4" aria-label="Roles">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Roles" }]} />
			<Roles />
		</section>
	);
}


