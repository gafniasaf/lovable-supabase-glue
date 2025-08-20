// @ts-nocheck
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createParentLinksGateway } from "@/lib/data/parentLinks";

type ParentLinkRow = { id: string; parent_id: string; student_id: string };

export default async function ParentDashboardPage() {
  const parentId = 'test-parent-id';
  const rows = await createParentLinksGateway().listByParent(parentId).catch(() => [] as ParentLinkRow[]);
  return (
    <section className="p-6 space-y-4" aria-label="Parent dashboard">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <h1 className="text-xl font-semibold">Parent dashboard</h1>
      <section>
        <h2 className="font-medium">Children</h2>
        <div className="mt-1 text-sm text-gray-600">
          <Link className="underline" href="/dashboard/parent/directory">Directory</Link>
          <span className="mx-2">·</span>
          <Link className="underline" href="/dashboard/parent/announcements">Announcements</Link>
        </div>
        <ul className="mt-3 space-y-2" data-testid="parent-children-list">
          {(rows ?? []).map(r => (
            <li key={r.id} data-testid="parent-child-row" className="border rounded p-3">
              <div className="text-sm">Student: <span className="font-mono">{r.student_id}</span></div>
            </li>
          ))}
          {(!rows || rows.length === 0) && (
            <li className="text-gray-500">No linked students.</li>
          )}
        </ul>
      </section>
    </section>
  );
}


