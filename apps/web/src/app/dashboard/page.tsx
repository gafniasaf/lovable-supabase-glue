import Link from "next/link";
import { createDashboardGateway } from "@/lib/data/dashboard";
import Trans from "@/lib/i18n/Trans";

export default async function DashboardPage() {
  try {
    const payload = await createDashboardGateway().get();
    const role = (payload as any).role as string;
    return (
      <section className="p-6 space-y-4" aria-label="Dashboard">
        <h1 className="text-xl font-semibold"><Trans keyPath="dashboard.title" fallback="Dashboard" /></h1>
        <p className="text-gray-500">Role: {role}</p>
        {role === 'teacher' && (
          <section className="space-y-2">
            <div className="text-sm text-gray-700">Active courses: {(payload as any)?.data?.kpis?.activeCourses?.value ?? 0}</div>
            <Link className="underline" href="/dashboard/teacher">Manage courses</Link>
            <div>
              <Link className="underline" href="/dashboard/teacher/grading-queue">Grading queue</Link>
            </div>
          </section>
        )}
        {role === 'student' && (
          <section>
            <h2 className="font-medium">My courses</h2>
            {!(payload as any)?.data && (
              <div className="space-y-2 mt-2">
                <div className="skeleton h-5 w-40" />
                <div className="skeleton h-5 w-56" />
              </div>
            )}
            <ul className="list-disc ml-5 mt-2">
              {(((payload as any)?.data?.courses) ?? []).map((r: any) => (
                <li key={r.courseId}><Link className="underline" href={`/dashboard/student/${r.courseId}`}>{r.title}</Link></li>
              ))}
              {(!((payload as any)?.data?.courses) || (payload as any).data.courses.length === 0) && <li className="text-gray-500 list-none">No courses yet.</li>}
            </ul>
          </section>
        )}
        {role === 'admin' && (
          <section className="space-y-2">
            <div className="text-sm text-gray-700">Total users: {(payload as any)?.data?.kpis?.totalUsers?.value ?? 0}</div>
            <Link className="underline" href="/dashboard/admin">Admin tools</Link>
          </section>
        )}
      </section>
    );
  } catch {
    return (
      <section className="p-6 space-y-3" aria-label="Dashboard">
        <h1 className="text-xl font-semibold"><Trans keyPath="dashboard.title" fallback="Dashboard" /></h1>
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <Link className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></Link></p>
      </section>
    );
  }
}


