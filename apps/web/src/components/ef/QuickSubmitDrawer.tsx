"use client";
import React from 'react';
import { Uploader } from '@/components/ef/Uploader';
import { efSubmitAssessment } from '@/lib/ef/api';

export default function QuickSubmitDrawer({ traineeId, programId, epaOptions }: { traineeId: string; programId: string; epaOptions: Array<{ id: string; label: string }> }) {
  const [open, setOpen] = React.useState(false);
  const [epaId, setEpaId] = React.useState<string>(epaOptions[0]?.id || '');
  const [note, setNote] = React.useState<string>('');
  const [busy, setBusy] = React.useState(false);
  const titleRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => { if (open) titleRef.current?.focus(); }, [open]);

  async function onSubmit() {
    try {
      setBusy(true);
      await efSubmitAssessment({ programId, epaId, body: note || undefined });
      setOpen(false);
      // Optional: window.location.reload() or router.refresh() in RSC context
    } catch (e: any) {
      // surface basic toast via alert for now
      alert(e?.message || 'Submit failed');
    } finally { setBusy(false); }
  }

  return (
    <div>
      <button onClick={() => setOpen(true)} data-testid="submit-open">Quick submit</button>
      {open && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)' }} onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}>
          <div style={{ maxWidth: 520, margin: '10vh auto', background: '#fff', padding: 16, borderRadius: 8 }}>
            <div ref={titleRef} tabIndex={-1} style={{ fontWeight: 700, marginBottom: 12 }}>Quick Submit</div>
            <label htmlFor="submit-epa-select">EPA</label>
            <select id="submit-epa-select" value={epaId} onChange={(e) => setEpaId(e.currentTarget.value)}>
              {epaOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <label htmlFor="submit-note">Note (optional)</label>
            <textarea id="submit-note" value={note} onChange={(e) => setNote(e.currentTarget.value)} />
            <Uploader entity="assessment" id={traineeId} allowed={["image/png","image/jpeg","application/pdf"]} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button id="submit-send" onClick={onSubmit} disabled={busy}>{busy ? 'Submitting...' : 'Submit'}</button>
              <button onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


