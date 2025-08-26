import Breadcrumbs from "@/components/ui/Breadcrumbs";
import StudentLeaderboard from "@/ui/v0/StudentLeaderboard";

export default async function StudentLeaderboardPage() {
	const rows = Array.from({ length: 10 }).map((_, i) => ({ rank: i + 1, name: `Student ${i + 1}`, xp: (10 - i) * 100 }));
	return (
		<section className="p-6 space-y-4" aria-label="Leaderboard">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Leaderboard" }]} />
			<StudentLeaderboard rows={rows as any} />
		</section>
	);
}


