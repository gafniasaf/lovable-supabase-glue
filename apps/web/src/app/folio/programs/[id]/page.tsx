import React from 'react';
import { createEfGateway } from '@/lib/data/expertfolio';

export default async function Page({ params }: { params: { id: string } }) {
  const gw = createEfGateway();
  const data = await gw.getProgramOverview({ programId: params.id });
  return (
    <div style={{ padding: 16 }}>
      <h2>ExpertFolio — Program Overview</h2>
      <div>Program: {params.id}</div>
      <div>EPAs: {data.epaCount}</div>
      <div>Trainees: {data.traineeCount}</div>
      <h3>Recent Evaluations</h3>
      <ul>
        {data.recentEvaluations.map((r, i) => (
          <li key={i}>{r.id} — {r.outcome} — {r.createdAt}</li>
        ))}
      </ul>
    </div>
  );
}


