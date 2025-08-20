import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createMessagesGateway } from "@/lib/data/messages";
import { revalidatePath } from "next/cache";

type Thread = { id: string; created_at: string; unread?: number };
type Message = { id: string; thread_id: string; sender_id: string; body: string; created_at: string };

export default async function InboxPage({ searchParams }: { searchParams?: { thread_id?: string } }) {
	const h = headers();
	const c = cookies();
	const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
	const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

	// List threads via gateway
	const threads: Thread[] = await createMessagesGateway().listThreads().catch(() => [] as any[]);

	const selectedThreadId = (searchParams?.thread_id ?? threads[0]?.id ?? '').trim();
	let messages: Message[] = [];
	if (selectedThreadId) {
		// Mark all read then fetch via gateway
		try { await fetch(`/api/messages/threads/${selectedThreadId}/read-all`, { method: 'PATCH', cache: 'no-store', headers: baseHeaders }); } catch {}
		messages = await createMessagesGateway().listMessages(selectedThreadId).catch(() => [] as any[]);
	}

	async function createThreadAction(formData: FormData) {
		"use server";
		const hh = headers();
		const cc = cookies();
		const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
		const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
		const val = String(formData.get("participant_id") || "").trim();
		const participant_ids = val ? [val] : [];
		const { createMessagesGateway } = await import("@/lib/data/messages");
		await createMessagesGateway().createThread(participant_ids);
		revalidatePath('/labs/system/inbox');
	}

	async function sendMessageAction(formData: FormData) {
		"use server";
		const hh = headers();
		const cc = cookies();
		const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
		const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
		const thread_id = String(formData.get('thread_id') || '').trim();
		const body = String(formData.get('body') || '').trim();
		if (!thread_id || !body) return;
		const { createMessagesGateway } = await import("@/lib/data/messages");
		await createMessagesGateway().sendMessage({ thread_id, body });
		revalidatePath('/labs/system/inbox');
	}

	return (
		<section className="p-6 space-y-4" aria-label="Inbox (labs)">
			<h1 className="text-xl font-semibold">Inbox (labs)</h1>
			<section className="border rounded p-3">
				<h2 className="font-medium mb-2">Create thread</h2>
				<form action={createThreadAction} className="flex flex-wrap gap-2 items-center">
					<input name="participant_id" placeholder="Participant ID" className="border rounded p-2" />
					<button className="bg-black text-white rounded px-3 py-1">Create</button>
				</form>
			</section>

			<section className="border rounded p-3">
				<h2 className="font-medium mb-2">Threads</h2>
				{threads.length === 0 ? (
					<div className="text-gray-600">No threads yet.</div>
				) : (
					<ul className="space-y-1">
						{threads.map(t => (
							<li key={t.id}>
								<a className="underline" href={`?thread_id=${t.id}`}>{t.id}</a>
								{typeof t.unread === 'number' && t.unread > 0 && (
									<span className="ml-2 text-xs bg-red-600 text-white rounded px-2 py-0.5">{t.unread}</span>
								)}
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="border rounded p-3">
				<h2 className="font-medium mb-2">Messages</h2>
				{!selectedThreadId ? (
					<div className="text-gray-600">Select a thread.</div>
				) : (
					<>
						<form action={async () => {
							"use server";
							const hh = headers(); const cc = cookies();
							const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
							const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
							try { await fetch(`/api/messages/threads/${selectedThreadId}/read-all`, { method: 'PATCH', cache: 'no-store', headers: { ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) } }); } catch {}
							revalidatePath('/labs/system/inbox');
						}} className="mb-2">
							<button className="border rounded px-2 py-1 text-xs">Mark all read</button>
						</form>
						<ul className="space-y-2">
							{messages.map(m => (
								<li key={m.id} className="border rounded p-2">
									<div className="text-xs text-gray-600">{new Date(m.created_at).toLocaleString()} — <span className="font-mono">{m.sender_id}</span></div>
									<div>{m.body}</div>
								</li>
							))}
						</ul>
						<form action={sendMessageAction} className="mt-3 flex gap-2">
							<input type="hidden" name="thread_id" value={selectedThreadId} />
							<input name="body" placeholder="Write a message" className="border rounded p-2 flex-1" />
							<button className="bg-black text-white rounded px-3 py-1">Send</button>
						</form>
					</>
				)}
			</section>
		</section>
	);
}


