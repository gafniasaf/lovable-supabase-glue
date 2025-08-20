// @ts-nocheck
export default async function ParentChildDetailPage({ params }: { params: { studentId: string } }) {
	return (
		<main className="p-6" data-testid="child-detail">
			<h1 className="text-xl font-semibold mb-2">Child detail</h1>
			<div>
				<span className="text-gray-600 mr-2">student_id:</span>
				<span data-testid="child-detail-student-id">{params.studentId}</span>
			</div>
		</main>
	);
}


