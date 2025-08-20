"use client";
import { useState } from "react";
import { createAssignmentsGateway } from "@/lib/data";
import { useRouter } from "next/navigation";
import AssignmentPicker from "./Picker";

export default function NewAssignmentPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [points, setPoints] = useState<number>(100);
  const [target, setTarget] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    setLoading(true);
    try {
      const created = await createAssignmentsGateway().create({ course_id: params.courseId, title, description, due_at: dueAt || undefined, points } as any);
      if (process.env.NEXT_PUBLIC_EXTERNAL_COURSES === '1' || process.env.EXTERNAL_COURSES === '1') {
        if (target && typeof target === 'object') {
          await createAssignmentsGateway().update(created.id, { target } as any).catch(() => {});
        }
      }
      setOk(true);
      router.push(`/dashboard/teacher/${params.courseId}/assignments`);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 max-w-xl space-y-4" aria-label="New assignment">
      <h1 className="text-xl font-semibold">New assignment</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      {ok && <p className="text-green-600 text-sm">Created!</p>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full border rounded px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Due at</label>
            <input className="w-full border rounded px-3 py-2" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Points</label>
            <input className="w-full border rounded px-3 py-2" type="number" min={0} max={1000} value={points} onChange={(e) => setPoints(Number(e.target.value || 0))} />
          </div>
        </div>
        <div className="border rounded p-3">
          <div className="font-medium mb-2">Target (optional)</div>
          <AssignmentPicker onChange={setTarget} />
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-black text-white rounded px-4 py-2 disabled:opacity-50" disabled={loading}>{loading ? 'Saving…' : 'Create'}</button>
          <a className="underline" href={`/dashboard/teacher/${params.courseId}/assignments`}>Cancel</a>
        </div>
      </form>
    </section>
  );
}


