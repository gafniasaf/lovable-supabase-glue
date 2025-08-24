import React from 'react';
import { createEfGateway } from '@/lib/data/expertfolio';
import ReviewDrawer from '@/components/ef/ReviewDrawer';

export default async function Page() {
  const gw = createEfGateway();
  const data = await gw.getSupervisorQueue({ supervisorId: '11111111-1111-1111-1111-111111111111' });
  const items = data.items || [];
  return (
    <div style={{ padding: 16 }}>
      <h2>ExpertFolio — Supervisor Queue</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Assessment</th><th>Trainee</th><th>Program</th><th>EPA</th><th>Submitted</th></tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i} data-testid="queue-row">
              <td>{r.assessmentId}</td>
              <td>{r.traineeId}</td>
              <td>{r.programId}</td>
              <td>{r.epaId}</td>
              <td>{r.submittedAt}</td>
              <td><ReviewDrawer assessmentId={r.assessmentId} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


