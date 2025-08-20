// @ts-nocheck
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type PageParams = {
	params: { courseId: string };
};

export default async function CoursePrintPage({ params }: PageParams) {
	const cookieStore = cookies();
	const testAuth = cookieStore.get("x-test-auth")?.value;

	const res = await serverFetch(`/api/lessons?course_id=${params.courseId}`, {
		cache: "no-store",
		headers: {
			...(testAuth ? { "x-test-auth": testAuth } : {}),
		},
	});

	if (res.status === 401) {
		return (
			<main className="p-6 space-y-3">
				<p className="text-gray-700">
					<Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> {" "}
					<a href="/login" className="underline" data-testid="login-link">
						<Trans keyPath="auth.signin" fallback="Sign in" />
					</a>
				</p>
			</main>
		);
	}

	let lessons: Array<{ id: string; title: string; content?: string; order_index?: number }> = [];
	if (res.ok) {
		lessons = await res.json();
	}

	lessons.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

	return (
		<main className="p-6 space-y-4">
			<h1 className="text-xl font-semibold" data-testid="print-title">
				Course lessons (print view)
			</h1>
			<ol className="space-y-3" data-testid="print-lessons">
				{(lessons ?? []).map((l) => (
					<li key={l.id} className="border rounded p-3" data-testid="lesson-row">
						<div className="font-medium">
							<span data-testid="lesson-order">#{l.order_index}</span>
							<span className="mx-2">-</span>
							<span data-testid="lesson-title">{l.title}</span>
						</div>
						<div className="text-gray-600 text-sm" data-testid="lesson-preview">
							{(l.content ?? "").slice(0, 140)}
						</div>
					</li>
				))}
				{(!lessons || lessons.length === 0) && (
					<li className="text-gray-500" data-testid="empty-state">
						No lessons yet.
					</li>
				)}
			</ol>
		</main>
	);
}


