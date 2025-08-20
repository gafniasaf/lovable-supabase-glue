import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default async function StudentAchievementsPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Achievements">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Achievements" }]} />
			<h1 className="text-xl font-semibold">Achievements</h1>
			<ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<li key={i} className="border rounded p-4 text-center text-sm">🏅 Achievement {i + 1}</li>
				))}
			</ul>
		</section>
	);
}


