import React from 'react';
import { createEfGateway } from '@/lib/data/expertfolio';
import QuickSubmitDrawer from '@/components/ef/QuickSubmitDrawer';

export default async function Page() {
  const gw = createEfGateway();
  const data = await gw.getTraineeProgress({ traineeId: '11111111-1111-1111-1111-111111111111', programId: '11111111-1111-1111-1111-111111111111' });
  const items = data.items || [];
  const totalCompleted = items.reduce((acc, it) => acc + (it.completed || 0), 0);
  const totalPending = items.reduce((acc, it) => acc + (it.pending || 0), 0);
  return (
    <div style={{ padding: 16 }}>
      <h2>ExpertFolio — Trainee Progress</h2>
      <div>Completed: {totalCompleted}</div>
      <div>Pending: {totalPending}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
        {items.map((it: any, idx: number) => (
          <div key={idx} data-testid="efa-card" style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>EPA: {it.epaId}</div>
            <div data-testid="progress-value">Completed: {it.completed}</div>
            <div>Pending: {it.pending}</div>
            {it.lastEvaluationAt ? <div>Last: {it.lastEvaluationAt}</div> : null}
          </div>
        ))}
      </div>
      <QuickSubmitDrawer traineeId={data.traineeId} programId={data.programId} epaOptions={items.map((i:any)=>({ id: i.epaId, label: i.epaId }))} />
    </div>
  );
}


