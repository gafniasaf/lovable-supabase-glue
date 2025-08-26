import SupervisorQueue, { QueueItem } from '@/ui/v0/SupervisorQueue';
import { serverFetch } from '@/lib/serverFetch';
import { supervisorQueueDto } from '@education/shared';

export default async function Page() {
  // In labs, use a placeholder supervisor id when none provided
  const supervisorId = 'supervisor-demo-id';
  let items: QueueItem[] = [];
  try {
    const res = await serverFetch('/api/ef/read/supervisor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ supervisorId }),
      cache: 'no-store'
    } as any);
    const json = await res.json();
    const parsed = supervisorQueueDto.parse(json);
    items = (parsed.items || []).map((r) => ({
      id: r.assessmentId,
      trainee: r.traineeId,
      epa: r.epaId,
      submittedAt: r.submittedAt,
      status: 'pending'
    }));
  } catch {
    // keep empty items on error
  }
  return (
    <section className="p-6">
      <SupervisorQueue items={items} page={1} pageCount={1} />
    </section>
  );
}


