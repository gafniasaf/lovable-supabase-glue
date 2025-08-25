import { getServerComponentSupabase, getCurrentUser } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { listTestLessonsByCourse } from "@/lib/testStore";
import { createLessonsGateway } from "@/lib/data/lessons";
import { createProgressGateway } from "@/lib/data/progress";
import Link from "next/link";
import Trans from "@/lib/i18n/Trans";
import LessonsClient from "./LessonsClient";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import { getServerComponentSupabase as getS } from "@/lib/supabaseServer";
import dynamic from "next/dynamic";
import { createEnrollmentsGateway } from "@/lib/data/enrollments";
const InteractiveEmbedClient = dynamic(() => import('./InteractiveEmbedClient'), { ssr: false });

export default async function StudentCoursePage({ params }: { params: { courseId: string } }) {
	const user = await getCurrentUser();
	if (!user) return <section className="p-6" aria-label="Course"><span><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></span></section>;
	const supabase = getServerComponentSupabase();
	let lessons: any[] = [];
	let course: any = null;
	if (isTestMode()) {
		lessons = listTestLessonsByCourse(params.courseId);
		course = { id: params.courseId, launch_kind: null, launch_url: null } as any;
	} else {
		const list = await createLessonsGateway().listByCourse(params.courseId).catch(() => []);
		const map = await createProgressGateway().getLessonCompletionMap(params.courseId).catch(() => ({} as Record<string, true>));
		lessons = list.map((l: any) => ({ ...l, isCompleted: !!(map as any)[l.id] }));
		const { data: c } = await supabase.from('courses').select('id,launch_kind,launch_url,provider_id').eq('id', params.courseId).single();
		course = c ?? null;
	}
	return (
		<section className="p-6 space-y-4" aria-label="Course">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/student" }, { label: "Course" }]} />
			<Tabs>
				<TabList>
					<Tab href={`/dashboard/student/${params.courseId}`} active>Overview</Tab>
					<Tab href={`/dashboard/student/${params.courseId}/assignments`}>Assignments</Tab>
					<Tab href={`/dashboard/student/${params.courseId}/quizzes/history`}>Quizzes</Tab>
				</TabList>
			</Tabs>
			<h1 className="text-xl font-semibold">Course</h1>
			{course?.launch_kind === 'WebEmbed' && course?.launch_url ? (
				<InteractiveEmbed courseId={params.courseId} launchUrl={course.launch_url} />
			) : null}
			{Array.isArray(lessons) ? (
				lessons.length === 0 ? (
					<div className="text-gray-500">No lessons yet.</div>
				) : (
					<LessonsClient courseId={params.courseId} initialLessons={lessons} />
				)
			) : (
				<div className="space-y-2">
					<div className="skeleton h-10 w-full" />
					<div className="skeleton h-10 w-full" />
				</div>
			)}
			<Link className="underline" href="/dashboard/student">Back to dashboard</Link>
		</section>
	);
}

export const dynamic = 'force-dynamic';

async function InteractiveEmbed({ courseId, launchUrl }: { courseId: string; launchUrl: string }) {
	const supabase = getS();
	const { data: enr } = await supabase.from('enrollments').select('id').eq('course_id', courseId).limit(1);
	const enrollmentId = enr?.[0]?.id as string | undefined;
	if (!enrollmentId) return null as any;
	const json = await createEnrollmentsGateway().createLaunchToken(enrollmentId).catch(() => null as any);
	const token = json?.token as string | undefined;
	if (!token) return null as any;
	const src = `${launchUrl}${launchUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
	let allowedOrigin = '';
	try {
		const u = new URL(launchUrl);
		allowedOrigin = `${u.protocol}//${u.host}`;
	} catch {}
	try {
		// Prefer provider domain if available
		const { data: providerJoin } = await supabase.from('courses').select('provider_id, course_providers:provider_id(domain)').eq('id', courseId).single();
		const domain = (providerJoin as any)?.course_providers?.domain as string | undefined;
		if (domain) {
			const d = new URL(domain);
			allowedOrigin = `${d.protocol}//${d.host}`;
		}
	} catch {}
	return <InteractiveEmbedClient courseId={courseId} src={src} allowedOrigin={allowedOrigin} /> as any;
}

 
