import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createModulesGateway } from "@/lib/data/modules";
import Trans from "@/lib/i18n/Trans";

type Module = { id: string; course_id: string; title: string; order_index: number; created_at: string };

export default async function ManageModulesPage({ params }: { params: { courseId: string } }) {
  const modules: Module[] = await createModulesGateway().listByCourse(params.courseId).catch(() => []);

  // Build CSV/JSON exports for modules
  const header = ["id", "course_id", "title", "order_index", "created_at"]; 
  const csvLines = [header.join(",")];
  for (const m of modules) {
    csvLines.push([
      m.id,
      m.course_id,
      `"${(m.title || '').replaceAll('"', '""')}"`,
      String(m.order_index),
      m.created_at
    ].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;
  const jsonHref = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(modules))}`;

  async function createAction(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "");
    const list = await createModulesGateway().listByCourse(params.courseId).catch(() => []);
    const nextOrder = ((list as Module[])[(list as Module[]).length - 1]?.order_index ?? 0) + 1;
    await createModulesGateway().create({ course_id: params.courseId, title, order_index: nextOrder });
    revalidatePath(`/dashboard/teacher/${params.courseId}/modules/manage`);
    redirect(`/dashboard/teacher/${params.courseId}/modules/manage`);
  }

  async function reorderAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id") || "");
    const direction = String(formData.get("direction") || "up");
    const list = await createModulesGateway().listByCourse(params.courseId).catch(() => []);
    const arr = list as Module[];
    const currentIndex = arr.findIndex(m => m.id === id);
    if (currentIndex < 0) return;
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= arr.length) return;
    const a = arr[currentIndex];
    const b = arr[swapIndex];
    await createModulesGateway().update(a.id, { order_index: b.order_index });
    await createModulesGateway().update(b.id, { order_index: a.order_index });
    revalidatePath(`/dashboard/teacher/${params.courseId}/modules/manage`);
    redirect(`/dashboard/teacher/${params.courseId}/modules/manage`);
  }

  return (
    <section className="p-6 space-y-4" aria-label="Manage modules">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manage Modules</h1>
        <div className="flex items-center gap-3">
          <a className="underline" href={csvHref} download={`modules-${params.courseId}.csv`} data-testid="modules-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
          <a className="underline" href={jsonHref} download={`modules-${params.courseId}.json`} data-testid="modules-json-link">Download JSON</a>
        </div>
      </div>
      <form action={createAction} className="flex gap-2" data-testid="create-form">
        <input name="title" placeholder="New module title" className="border rounded px-2 py-1" data-testid="create-title" />
        <button className="bg-black text-white rounded px-3 py-1" type="submit" data-testid="create-save">Add</button>
      </form>
      <ul className="space-y-2" data-testid="manage-modules-list">
        {modules.map((m, i) => (
          <li key={m.id} className="border rounded p-2 flex items-center justify-between" data-testid="manage-module-row">
            <span className="font-medium">#{m.order_index} - {m.title}</span>
            <div className="flex gap-2">
              <form action={reorderAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="direction" value="up" />
                <button className="px-2 py-1 border rounded" disabled={i === 0} data-testid="btn-up">↑</button>
              </form>
              <form action={reorderAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="direction" value="down" />
                <button className="px-2 py-1 border rounded" disabled={i === modules.length - 1} data-testid="btn-down">↓</button>
              </form>
            </div>
          </li>
        ))}
        {modules.length === 0 && (<li className="text-gray-500">No modules yet.</li>)}
      </ul>
      <a className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
    </section>
  );
}


