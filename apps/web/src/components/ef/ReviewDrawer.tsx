"use client";
import React from 'react';
import { Uploader } from '@/components/ef/Uploader';
import { efCreateEvaluation } from '@/lib/ef/api';

export default function ReviewDrawer({ assessmentId, onClose }: { assessmentId: string; onClose?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [outcome, setOutcome] = React.useState<'approved'|'rejected'|'needs_changes'>('approved');
  const [comments, setComments] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const titleRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => { if (open) titleRef.current?.focus(); }, [open]);

  async function submit() {
    try {
      setBusy(true);
      const res = await efCreateEvaluation({ assessmentId, outcome, comments: comments || undefined });
      alert(`Reviewed (${res.requestId || ''})`);
      setOpen(false);
      onClose?.();
    } catch (e: any) {
      alert(e?.message || 'Review failed');
    } finally { setBusy(false); }
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <button data-testid="review-open" onClick={() => setOpen(true)}>Review</button>
      {open && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); onClose?.(); } }}>
          <div style={{ maxWidth: 520, margin: '10vh auto', background: '#fff', padding: 16, borderRadius: 8 }}>
            <div ref={titleRef} tabIndex={-1} style={{ fontWeight: 700, marginBottom: 12 }}>Review Evaluation</div>
            <div role="group" aria-labelledby="review-outcome">
              <div id="review-outcome">Outcome</div>
              <label><input data-testid="review-outcome-approve" type="radio" name="outcome" checked={outcome==='approved'} onChange={() => setOutcome('approved')} /> Approve</label>
              <label><input type="radio" name="outcome" checked={outcome==='rejected'} onChange={() => setOutcome('rejected')} /> Reject</label>
              <label><input type="radio" name="outcome" checked={outcome==='needs_changes'} onChange={() => setOutcome('needs_changes')} /> Needs changes</label>
            </div>
            <label htmlFor="review-comments">Comments</label>
            <textarea id="review-comments" value={comments} onChange={(e) => setComments(e.currentTarget.value)} />
            <Uploader entity="evaluation" id={assessmentId} allowed={["image/png","image/jpeg","application/pdf"]} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button data-testid="review-submit" onClick={submit} disabled={busy}>{busy ? 'Submitting...' : 'Submit'}</button>
              <button onClick={() => { setOpen(false); onClose?.(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


