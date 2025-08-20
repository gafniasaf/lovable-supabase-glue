"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submissionGradeRequest } from "@education/shared";
import { z } from "zod";
import { createSubmissionsGateway } from "@/lib/data/submissions";
import { fireToast } from "@/components/ui/Toast";

type FormValues = z.infer<typeof submissionGradeRequest>;

export default function GradeRowClient({ id, initialScore, initialFeedback }: { id: string; initialScore: number | null; initialFeedback: string | null }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(submissionGradeRequest),
    defaultValues: { score: initialScore ?? 0, feedback: initialFeedback ?? "" }
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<null | 'ok' | 'err'>(null);
  async function onSave(values: any) {
    setSaving(true);
    setOk(null);
    const prev = form.getValues();
    try {
      // Optimistic UI: set immediately
      form.setValue('score', values.score);
      form.setValue('feedback', values.feedback);
      await createSubmissionsGateway().grade(id, values);
      setOk('ok');
      fireToast('Grade saved', 'success');
      try { window.dispatchEvent(new CustomEvent('notifications:updated')); } catch {}
    } catch {
      // Revert on failure
      form.setValue('score', prev.score);
      form.setValue('feedback', prev.feedback);
      setOk('err');
      fireToast('Failed to save grade', 'error');
    } finally {
      setSaving(false);
      setTimeout(() => setOk(null), 2000);
    }
  }
  return (
    <form onSubmit={form.handleSubmit(onSave)} className="flex items-center gap-2" data-testid="grade-form">
      <input type="hidden" name="id" value={id} />
      <input {...form.register('score', { valueAsNumber: true })} name="score" type="number" min={0} max={100} className="border rounded p-1 w-20" data-testid="grade-score" />
      <input {...form.register('feedback')} name="feedback" type="text" className="border rounded p-1 w-48" placeholder="Feedback" data-testid="grade-feedback" />
      <button className="bg-black text-white rounded px-3 py-1 disabled:opacity-50" type="submit" disabled={saving} data-testid="grade-save">{saving ? 'Saving…' : 'Save'}</button>
      {form.formState.errors.score && <span className="text-red-700 text-xs">{(form.formState.errors.score.message as string) ?? 'Invalid'}</span>}
      {ok === 'ok' && <span className="text-green-700 text-xs">Saved</span>}
      {ok === 'err' && <span className="text-red-700 text-xs">Error</span>}
    </form>
  );
}


