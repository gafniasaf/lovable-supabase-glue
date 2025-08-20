// @ts-nocheck
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createQuizzesGateway } from "@/lib/data/quizzes";

type Question = { id: string; quiz_id: string; text: string; order_index: number };
type Choice = { id: string; question_id: string; text: string; correct: boolean; order_index: number };

export default function QuizPlayerClient({ quizId, questions, choicesByQuestion, timeLimitSec, existingAttemptId, secondsLeftInitial }: { quizId: string; questions: Question[]; choicesByQuestion: Record<string, Choice[]>; timeLimitSec?: number | null; existingAttemptId?: string | null; secondsLeftInitial?: number | null }) {
  const [attemptId, setAttemptId] = useState<string | null>(existingAttemptId ?? null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(secondsLeftInitial ?? null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (existingAttemptId) return; // resume existing attempt
      try {
        const data = await createQuizzesGateway().startAttempt({ quiz_id: quizId } as any);
        if (mounted) setAttemptId((data as any)?.id ?? null);
      } catch {}
    })();
    return () => { mounted = false; };
  }, [quizId, existingAttemptId]);

  // Start countdown only after attempt exists
  useEffect(() => {
    if (secondsLeftInitial != null) return; // already set from server
    if (attemptId && timeLimitSec && timeLimitSec > 0) setSecondsLeft(timeLimitSec);
  }, [attemptId, timeLimitSec, secondsLeftInitial]);

  // Autosave when a choice is selected
  const onSelect = async (questionId: string, choiceId: string) => {
    if (!attemptId) return;
    try {
      await createQuizzesGateway().upsertAnswer({ attempt_id: attemptId, question_id: questionId, choice_id: choiceId } as any);
    } catch {}
  };

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    let id = attemptId;
    try {
      if (!id) {
        const data = await createQuizzesGateway().startAttempt({ quiz_id: quizId } as any);
        id = (data as any)?.id ?? null;
      }
      if (id) {
        await createQuizzesGateway().submitAttempt({ attempt_id: id } as any);
      }
    } catch {}
    setTimeout(() => window.location.reload(), 300); // allow request to settle
  }, [attemptId, quizId]);

  // Countdown timer
  useEffect(() => {
    if (!secondsLeft || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s == null) return s;
        if (s <= 1) {
          clearInterval(id);
          submit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft, submit]);

  const mmss = useMemo(() => {
    if (secondsLeft == null) return null;
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [secondsLeft]);

  return (
    <div>
      {mmss && (
        <div className="rounded border p-2 inline-block mb-3" data-testid="quiz-timer">
          Time left: <span className="font-mono">{mmss}</span>
        </div>
      )}
      <ol className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.id}>
            <div className="mb-1" data-testid="quiz-question">{idx + 1}. {q.text}</div>
            <ul className="space-y-1">
              {(choicesByQuestion[q.id] || []).map((ch) => (
                <li key={ch.id}>
                  <label className="flex items-center gap-2" data-testid="quiz-choice">
                    <input type="radio" name={`q_${q.id}`} value={ch.id} onChange={() => onSelect(q.id, ch.id)} />
                    <span>{ch.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <button onClick={submit} className="mt-4 rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50" data-testid="quiz-submit-btn" disabled={submittingRef.current}>Submit</button>
    </div>
  );
}


