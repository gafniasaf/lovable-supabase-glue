import React from 'react';
import { createEfGateway } from '@/lib/data/expertfolio';
import SupervisorQueueClient from './SupervisorQueueClient';

export default async function Page() {
  const gw = createEfGateway();
  const data = await gw.getSupervisorQueue({ supervisorId: '11111111-1111-1111-1111-111111111111' });
  const items = (data.items || []).map((r) => ({
    id: r.assessmentId,
    trainee: r.traineeId,
    epa: r.epaId,
    submittedAt: r.submittedAt,
    status: 'pending' as const,
  }));
  return (
    <div className="p-6">
      <SupervisorQueueClient items={items} page={1} pageCount={1} />
    </div>
  );
}


