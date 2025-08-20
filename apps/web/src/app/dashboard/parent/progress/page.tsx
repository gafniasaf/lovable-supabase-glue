import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createParentLinksGateway } from "@/lib/data/parentLinks";
import { createParentProgressGateway } from "@/lib/data/parentProgress";

export default async function ParentProgressPage() {
  const parentId = '33333333-3333-3333-3333-333333333333';
  const links = await createParentLinksGateway().listByParent(parentId).catch(() => [] as any[]);
  return (
    <section className="p-6 space-y-4" aria-label="Children Progress">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/parent" }, { label: "Progress" }]} />
      <h1 className="text-xl font-semibold">Children Progress</h1>
      <div className="space-y-4" data-testid="parent-children-progress">
        {await Promise.all(links.map(async (pl: any) => {
          const gw = createParentProgressGateway();
          const courses = await gw.list(pl.student_id).catch(() => [] as any[]);
          return (
            <section key={`${pl.parent_id}-${pl.student_id}`} className="border rounded p-3">
              <div className="text-sm mb-2">Student: <span className="font-mono">{pl.student_id}</span></div>
              {courses.length === 0 ? (
                <div className="text-xs text-gray-500">No courses</div>
              ) : (
                <ul className="space-y-2">
                  {courses.map((c: any) => (
                    <li key={c.course_id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{c.course_id}</span>
                        <span className="text-xs text-gray-600">{c.completedLessons}/{c.totalLessons} ({c.percent}%)</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-200 rounded">
                        <div className="h-2 bg-green-500 rounded" style={{ width: `${c.percent}%` }} aria-label="Progress bar" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        }))}
        {(!links || links.length === 0) && <div className="text-gray-500">No linked students.</div>}
      </div>
    </section>
  );
}


