export type KPI = { id: string; label: string; value: number; trend: 'up' | 'down' | 'flat' };
export type QuickLink = { id: string; label: string; href: string; icon?: string };

export default function TeacherDashboardUI(props: {
  header?: { title: string; subtitle?: string };
  kpis?: KPI[];
  quickLinks?: QuickLink[];
  recentlyGraded?: any[];
  notifications?: any[];
  state?: 'default' | 'empty';
}) {
  const title = props?.header?.title || 'Teacher Dashboard';
  return (
    <section className="p-6 space-y-4" aria-label="Teacher Dashboard">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="text-gray-500 text-sm">Placeholder UI</div>
    </section>
  ) as any;
}
