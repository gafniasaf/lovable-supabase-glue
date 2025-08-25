import SupervisorQueue, { QueueItem } from '@/ui/v0/SupervisorQueue';

export default function Page() {
  const demo: QueueItem[] = [
    { id: '1', trainee: 'Dr. Sarah Johnson', epa: 'EPA 1.1 - History Taking', submittedAt: 'Jan 15, 2024', status: 'pending' },
    { id: '2', trainee: 'Dr. Michael Chen', epa: 'EPA 2.3 - Physical Examination', submittedAt: 'Jan 14, 2024', status: 'in-review' },
    { id: '3', trainee: 'Dr. Emily Rodriguez', epa: 'EPA 3.2 - Clinical Reasoning', submittedAt: 'Jan 13, 2024', status: 'completed' },
  ];
  return (
    <section className="p-6">
      <SupervisorQueue items={demo} page={1} pageCount={3} onSelect={() => {}} />
    </section>
  );
}


