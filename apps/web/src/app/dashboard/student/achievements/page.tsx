import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudentAchievements from "@/ui/v0/StudentAchievements";

export default async function StudentAchievementsPage() {
	const items = Array.from({ length: 8 }).map((_, i) => ({ id: i, label: `Achievement ${i + 1}`, icon: '🏅' }));
	return (
		<section className="p-6 space-y-4" aria-label="Achievements">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Achievements" }]} />
			<StudentAchievements items={items as any} />
		</section>
	);
}


