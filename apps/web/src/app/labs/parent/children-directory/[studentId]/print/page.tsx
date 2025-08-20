export default async function ParentChildPrintPage({ params }: { params: { studentId: string } }) {
	return (
		<main className="p-6">
			<div className="border rounded p-4 inline-block" data-testid="print-student-card">
				<div className="text-lg font-medium mb-2">Student card</div>
				<div>
					<span className="text-gray-600 mr-2">student_id:</span>
					<span data-testid="print-student-id">{params.studentId}</span>
				</div>
			</div>
		</main>
	);
}


