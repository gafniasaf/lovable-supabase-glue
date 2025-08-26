import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudentXP from "@/ui/v0/StudentXP";

export default async function StudentXPPage() {
	return (
		<section className="p-6 space-y-4" aria-label="XP">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "XP" }]} />
			<StudentXP />
		</section>
	);
}


