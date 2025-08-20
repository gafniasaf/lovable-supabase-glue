// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default async function StudentLeaderboardPage() {
	return (
		<section className="p-6 space-y-4" aria-label="Leaderboard">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Leaderboard" }]} />
			<h1 className="text-xl font-semibold">Leaderboard</h1>
			<table className="w-full border text-sm">
				<thead><tr className="bg-gray-50"><th className="p-2 text-left">Rank</th><th className="p-2 text-left">Student</th><th className="p-2 text-right">XP</th></tr></thead>
				<tbody>
					{Array.from({ length: 10 }).map((_, i) => (
						<tr key={i} className="border-b"><td className="p-2">{i + 1}</td><td className="p-2">Student {i + 1}</td><td className="p-2 text-right">{(10 - i) * 100}</td></tr>
					))}
				</tbody>
			</table>
		</section>
	);
}


