// Type definitions for Next.js routes

/**
 * Internal types used by the Next.js router and Link component.
 * These types are not meant to be used directly.
 * @internal
 */
declare namespace __next_route_internal_types__ {
  type SearchOrHash = `?${string}` | `#${string}`
  type WithProtocol = `${string}:${string}`

  type Suffix = '' | SearchOrHash

  type SafeSlug<S extends string> = S extends `${string}/${string}`
    ? never
    : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
    ? never
    : S

  type OptionalCatchAllSlug<S extends string> =
    S extends `${string}${SearchOrHash}` ? never : S

  type StaticRoutes = 
    | `/`
    | `/admin/providers`
    | `/admin/outcomes`
    | `/admin/conformance`
    | `/dashboard`
    | `/dashboard/admin`
    | `/dashboard/admin/audit`
    | `/dashboard/admin/catalog`
    | `/dashboard/admin/flags`
    | `/dashboard/admin/health`
    | `/dashboard/admin/profile`
    | `/dashboard/admin/parent-links`
    | `/dashboard/admin/providers`
    | `/dashboard/admin/quotas`
    | `/dashboard/admin/reports`
    | `/dashboard/admin/users`
    | `/dashboard/admin/roles`
    | `/dashboard/admin/metrics`
    | `/dashboard/parent`
    | `/dashboard/parent/announcements`
    | `/dashboard/parent/directory`
    | `/dashboard/parent/progress`
    | `/dashboard/parent/messages`
    | `/dashboard/notifications`
    | `/dashboard/settings`
    | `/dashboard/student`
    | `/dashboard/student/messages`
    | `/dashboard/student/leaderboard`
    | `/dashboard/student/plan`
    | `/dashboard/student/achievements`
    | `/dashboard/student/timeline`
    | `/dashboard/student/profile`
    | `/dashboard/student/xp`
    | `/dashboard/teacher`
    | `/dashboard/teacher/enrollments`
    | `/dashboard/teacher/grading-queue`
    | `/dashboard/teacher/new`
    | `/dashboard/teacher/profile`
    | `/dashboard/teacher/messages`
    | `/api/__test__/reset`
    | `/api/announcements`
    | `/api/assignments`
    | `/api/admin/audit-logs`
    | `/api/admin/export`
    | `/api/admin/quotas`
    | `/api/admin/metrics`
    | `/api/auth/logout`
    | `/api/courses`
    | `/api/dashboard`
    | `/api/enrollments`
    | `/api/events`
    | `/api/files/attachment`
    | `/api/files/finalize`
    | `/api/files/resolve`
    | `/api/files/upload-url`
    | `/api/files/download-url`
    | `/api/health`
    | `/api/flags`
    | `/api/internal/log`
    | `/api/internal/metrics`
    | `/api/lessons`
    | `/api/lessons/complete`
    | `/api/lessons/reorder`
    | `/api/messages`
    | `/api/messages/threads`
    | `/api/notifications`
    | `/api/notifications/read-all`
    | `/api/notifications/preferences`
    | `/api/parent/progress`
    | `/api/parent-links`
    | `/api/providers`
    | `/api/providers/health`
    | `/api/providers/health/summaries`
    | `/api/modules`
    | `/api/quiz-choices`
    | `/api/quiz-attempts`
    | `/api/quiz-attempts/submit`
    | `/api/progress`
    | `/api/quizzes`
    | `/api/quiz-questions`
    | `/api/registry/courses`
    | `/api/registry/versions`
    | `/api/ready`
    | `/api/reports/activity`
    | `/api/reports/engagement`
    | `/api/reports/retention`
    | `/api/reports/grade-distribution`
    | `/api/runtime/asset/sign-url`
    | `/api/runtime/auth/exchange`
    | `/api/runtime/checkpoint/load`
    | `/api/runtime/checkpoint/save`
    | `/api/runtime/context`
    | `/api/runtime/event`
    | `/api/runtime/events`
    | `/api/runtime/grade`
    | `/api/runtime/outcomes`
    | `/api/runtime/outcomes/export`
    | `/api/runtime/teacher/outcomes`
    | `/api/runtime/progress`
    | `/api/submissions`
    | `/api/test/reset`
    | `/api/test/storage/clean`
    | `/api/test/seed`
    | `/api/test/switch-role`
    | `/api/user`
    | `/api/user/profile`
    | `/api/user/role`
    | `/api/users`
    | `/api/teacher/grading-queue`
    | `/labs/admin/flags`
    | `/labs/admin/roles`
    | `/labs/parent/announcements`
    | `/labs/parent/children`
    | `/labs/parent/children-admin-report`
    | `/labs/parent/children-directory`
    | `/labs/parent/children-quick-links`
    | `/labs/parent/children-directory-advanced`
    | `/labs/parent/children-report`
    | `/labs/student/enrollments-grid`
    | `/labs/student/learning-overview`
    | `/labs/student/study-digest`
    | `/labs/student/learning-overview-advanced`
    | `/labs/student/learning-overview-detailed`
    | `/labs/student/study-planner`
    | `/labs/student/study-timeline`
    | `/labs/student/upcoming-lessons`
    | `/labs/student/profile`
    | `/labs/expertfolio`
    | `/labs/teacher/analytics`
    | `/labs/teacher/announcements`
    | `/labs/teacher/content-quality-report`
    | `/labs/teacher/course-insights`
    | `/labs/teacher/course-insights-advanced`
    | `/labs/teacher/course-insights-pro`
    | `/labs/teacher/courses-grid`
    | `/labs/teacher/courses-print-pack`
    | `/labs/teacher/engagement`
    | `/labs/teacher/grade-distribution`
    | `/labs/teacher/grading-queue`
    | `/labs/teacher/course-cards-with-counts`
    | `/labs/teacher/lesson-catalog`
    | `/labs/system/auth-check`
    | `/labs/teacher/lesson-audit-pro`
    | `/labs/system/diagnostics-suite`
    | `/labs/system/health`
    | `/labs/system/health-history`
    | `/labs/system/inbox`
    | `/labs/system/latency-sampler`
    | `/labs/system/latency-histogram`
    | `/labs/system/events`
    | `/labs/system/observer`
    | `/labs/system/notifications`
    | `/labs/system/ok-card`
    | `/labs/system/role-badge`
    | `/labs/system/request-id`
    | `/labs/system/throughput-profiler`
    | `/labs/system/percentile-trends`
    | `/labs/system/uptime-tile`
    | `/login`
  type DynamicRoutes<T extends string = string> = 
    | `/admin/providers/${SafeSlug<T>}`
    | `/dashboard/student/${SafeSlug<T>}`
    | `/dashboard/student/${SafeSlug<T>}/assignments`
    | `/dashboard/student/${SafeSlug<T>}/assignments/${SafeSlug<T>}`
    | `/dashboard/student/${SafeSlug<T>}/assignments/${SafeSlug<T>}/submit`
    | `/dashboard/student/${SafeSlug<T>}/quizzes/${SafeSlug<T>}/play`
    | `/dashboard/student/${SafeSlug<T>}/quizzes/history`
    | `/dashboard/teacher/${SafeSlug<T>}`
    | `/dashboard/teacher/${SafeSlug<T>}/analytics`
    | `/dashboard/teacher/${SafeSlug<T>}/lessons/manage`
    | `/dashboard/teacher/${SafeSlug<T>}/lessons/new`
    | `/dashboard/teacher/${SafeSlug<T>}/assignments`
    | `/dashboard/teacher/${SafeSlug<T>}/assignments/${SafeSlug<T>}/submissions`
    | `/dashboard/teacher/${SafeSlug<T>}/assignments/new`
    | `/dashboard/teacher/${SafeSlug<T>}/announcements`
    | `/dashboard/teacher/${SafeSlug<T>}/modules`
    | `/dashboard/teacher/${SafeSlug<T>}/modules/manage`
    | `/dashboard/teacher/${SafeSlug<T>}/quizzes`
    | `/dashboard/teacher/${SafeSlug<T>}/quizzes/${SafeSlug<T>}/attempts`
    | `/dashboard/teacher/${SafeSlug<T>}/quizzes/${SafeSlug<T>}/manage`
    | `/api/courses/${SafeSlug<T>}`
    | `/api/courses/${SafeSlug<T>}/transfer-owner`
    | `/api/enrollments/${SafeSlug<T>}/launch-token`
    | `/api/messages/threads/${SafeSlug<T>}/read-all`
    | `/labs/parent/children/${SafeSlug<T>}`
    | `/labs/parent/children-directory/${SafeSlug<T>}/print`
    | `/labs/teacher/${SafeSlug<T>}/lessons-print-summary`
    | `/labs/teacher/${SafeSlug<T>}/print`

  type RouteImpl<T> = 
    | StaticRoutes
    | SearchOrHash
    | WithProtocol
    | `${StaticRoutes}${SearchOrHash}`
    | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)
    
}

declare module 'next' {
  export { default } from 'next/types/index.js'
  export * from 'next/types/index.js'

  export type Route<T extends string = string> =
    __next_route_internal_types__.RouteImpl<T>
}

declare module 'next/link' {
  import type { LinkProps as OriginalLinkProps } from 'next/dist/client/link.js'
  import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'
  import type { UrlObject } from 'url'

  type LinkRestProps = Omit<
    Omit<
      DetailedHTMLProps<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >,
      keyof OriginalLinkProps
    > &
      OriginalLinkProps,
    'href'
  >

  export type LinkProps<RouteInferType> = LinkRestProps & {
    /**
     * The path or URL to navigate to. This is the only required prop. It can also be an object.
     * @see https://nextjs.org/docs/api-reference/next/link
     */
    href: __next_route_internal_types__.RouteImpl<RouteInferType> | UrlObject
  }

  export default function Link<RouteType>(props: LinkProps<RouteType>): JSX.Element
}

declare module 'next/navigation' {
  export * from 'next/dist/client/components/navigation.js'

  import type { NavigateOptions, AppRouterInstance as OriginalAppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime.js'
  interface AppRouterInstance extends OriginalAppRouterInstance {
    /**
     * Navigate to the provided href.
     * Pushes a new history entry.
     */
    push<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Navigate to the provided href.
     * Replaces the current history entry.
     */
    replace<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>, options?: NavigateOptions): void
    /**
     * Prefetch the provided href.
     */
    prefetch<RouteType>(href: __next_route_internal_types__.RouteImpl<RouteType>): void
  }

  export declare function useRouter(): AppRouterInstance;
}
