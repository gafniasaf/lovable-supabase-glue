"use client";
import { useEffect, useState, useTransition } from "react";
import LessonAttachment from "./LessonAttachment";
import { createLessonsGateway } from "@/lib/data/lessons";

export default function LessonsClient({ courseId, initialLessons }: { courseId: string; initialLessons: any[] }) {
	const [isPending, startTransition] = useTransition();
	const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
	const [items, setItems] = useState(initialLessons);
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const hash = window.location.hash;
		if (hash && hash.startsWith('#lesson-')) {
			const el = document.querySelector(hash);
			if (el && 'scrollIntoView' in el) {
				(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}, []);
	async function toggleComplete(lessonId: string) {
		setOptimistic((prev) => ({ ...prev, [lessonId]: true }));
		startTransition(async () => {
			try {
				await createLessonsGateway().markComplete(lessonId);
			} catch {
				setOptimistic((prev) => ({ ...prev, [lessonId]: false }));
			}
		});
	}
	return (
		<section>
			<h2 className="font-medium">Lessons</h2>
			<ul className="space-y-2 mt-2">
				{(items ?? []).map((l: any) => {
					const done = optimistic[l.id] || l.isCompleted;
					return (
						<li key={l.id} id={`lesson-${l.id}`} className="border rounded p-2">
							<div className="flex items-center justify-between">
								<span>
									<span className={`inline-block w-2 h-2 rounded-full mr-2 ${done ? 'bg-green-500' : 'bg-gray-300'}`} />
									#{l.order_index} - {l.title}
								</span>
								<button className="text-sm underline disabled:opacity-50" disabled={done || isPending} onClick={() => toggleComplete(l.id)}>
									{done ? 'Completed' : 'Mark complete'}
								</button>
							</div>
							{l.file_key && (
								<LessonAttachment keyName={l.file_key} />
							)}
						</li>
					);
				})}
				{(!items || items.length === 0) && <li className="text-gray-500">No lessons yet.</li>}
			</ul>
		</section>
	);
}


