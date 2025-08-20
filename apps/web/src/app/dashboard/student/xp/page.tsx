import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default async function StudentXPPage() {
	return (
		<section className="p-6 space-y-4" aria-label="XP">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "XP" }]} />
			<h1 className="text-xl font-semibold">XP</h1>
			<div className="border rounded p-4">
				<div className="text-sm text-gray-600">Level</div>
				<div className="text-2xl font-semibold">—</div>
				<div className="mt-2 h-2 bg-gray-200 rounded"><div className="h-2 bg-green-500 rounded" style={{ width: '40%' }} /></div>
			</div>
		</section>
	);
}


