"use client";

export type StudentCourseOverviewProps = {
  header: {
    courseTitle: string;
    progressPct: number; // 0–100
    tabLinks: { id: string; label: string; href: string; current?: boolean }[];
  };
  nextLesson?: { title: string; hint?: string; ctaLabel: string; href: string } | null;
  lessons: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    duration?: string; // e.g., "8 min"
    href: string;
  }>;
  state?: "default" | "loading" | "empty";
};

export default function StudentCourseOverview({ header, nextLesson, lessons, state = "default" }: StudentCourseOverviewProps) {
  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
          <div className="flex gap-6 border-b border-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-20 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No lessons available</h3>
            <p className="text-sm text-muted-foreground">This course doesn't have any lessons yet. Check back later for updates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-4">
          <h1 data-testid="student-course-title" className="text-2xl font-bold text-foreground">{header.courseTitle}</h1>
          <div className="flex items-center gap-4">
            <div data-testid="student-progress-ring" className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 28}`} strokeDashoffset={`${2 * Math.PI * 28 * (1 - header.progressPct / 100)}`} className="text-primary transition-all duration-300" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-foreground">{Math.round(header.progressPct)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Course Progress</p>
              <p className="text-xs text-muted-foreground">{Math.round(header.progressPct)}% complete</p>
            </div>
          </div>
        </div>
        <div className="border-b border-border">
          <nav className="flex gap-6" role="tablist">
            {header.tabLinks.map((tab) => (
              <a key={tab.id} href={tab.href} role="tab" aria-selected={tab.current} className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${tab.current ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-muted-foreground"}`}>
                {tab.label}
              </a>
            ))}
          </nav>
        </div>
        {nextLesson && (
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Next up</p>
                <h3 className="text-lg font-semibold text-foreground">{nextLesson.title}</h3>
                {nextLesson.hint && <p className="text-sm text-muted-foreground">{nextLesson.hint}</p>}
              </div>
              <a href={nextLesson.href} data-testid="student-next-cta" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {nextLesson.ctaLabel}
              </a>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Lessons</h2>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <a key={lesson.id} href={lesson.href} data-testid="student-lessons-item" className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <div className="flex-shrink-0">
                  {lesson.isCompleted ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium ${lesson.isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>{lesson.title}</h3>
                </div>
                {lesson.duration && (
                  <div className="flex-shrink-0"><span className="text-xs text-muted-foreground">{lesson.duration}</span></div>
                )}
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


