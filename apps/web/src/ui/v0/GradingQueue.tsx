"use client";

export type GradingQueueProps = {
  header?: { totalEstimated?: number };
  filters: {
    courses: { id: string; label: string; href: string; selected?: boolean }[];
    assignments: { id: string; label: string; href: string; selected?: boolean }[];
    pageSizes: { value: number; label: string; href: string; selected?: boolean }[];
    applyHref?: string;
  };
  items: Array<{
    id: string;
    courseTitle?: string | null;
    studentName: string;
    submittedAt: string; // ISO string preferred
    openHref: string;
  }>;
  pagination: {
    page: number;
    prevHref?: string | null;
    nextHref?: string | null;
    totalHint?: string; // e.g. "~123 total"
  };
  state?: "default" | "loading" | "empty";
};

export default function GradingQueue({ header, filters, items, pagination, state = "default" }: GradingQueueProps) {
  const selectedCourse = filters.courses.find((c) => c.selected);
  const selectedAssignment = filters.assignments.find((a) => a.selected);
  const selectedPageSize = filters.pageSizes.find((p) => p.selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {header?.totalEstimated !== undefined && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Grading Queue</h1>
                  <p className="text-lg text-muted-foreground mt-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" aria-hidden />
                      {header.totalEstimated} submissions awaiting review
                    </span>
                  </p>
                </div>
                <div className="hidden sm:block" aria-hidden>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-secondary rounded-full" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">Filter Submissions</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="course-select" className="block text-sm font-medium text-foreground">Course</label>
                <select
                  id="course-select"
                  data-testid="grading-filter-course"
                  className="w-full px-4 py-3 border border-border bg-background/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                  defaultValue={selectedCourse?.id || ""}
                  disabled={state === "loading"}
                  onChange={(e) => {
                    const course = filters.courses.find((c) => c.id === e.target.value);
                    if (course?.href) window.location.href = course.href;
                  }}
                >
                  {filters.courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="assignment-select" className="block text-sm font-medium text-foreground">Assignment</label>
                <select
                  id="assignment-select"
                  data-testid="grading-filter-assignment"
                  className="w-full px-4 py-3 border border-border bg-background/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                  defaultValue={selectedAssignment?.id || ""}
                  disabled={state === "loading" || filters.assignments.length === 0}
                  onChange={(e) => {
                    const assignment = filters.assignments.find((a) => a.id === e.target.value);
                    if (assignment?.href) window.location.href = assignment.href;
                  }}
                >
                  {filters.assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>{assignment.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="page-size-select" className="block text-sm font-medium text-foreground">Per page</label>
                <select
                  id="page-size-select"
                  data-testid="grading-page-size"
                  className="w-full px-4 py-3 border border-border bg-background/50 text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                  defaultValue={selectedPageSize?.value || ""}
                  disabled={state === "loading"}
                  onChange={(e) => {
                    const pageSize = filters.pageSizes.find((p) => p.value === Number(e.target.value));
                    if (pageSize?.href) window.location.href = pageSize.href;
                  }}
                >
                  {filters.pageSizes.map((pageSize) => (
                    <option key={pageSize.value} value={pageSize.value}>{pageSize.label}</option>
                  ))}
                </select>
              </div>

              {filters.applyHref && (
                <div className="flex items-end">
                  <a
                    href={filters.applyHref}
                    data-testid="grading-apply"
                    className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium text-center"
                    aria-disabled={state === "loading"}
                  >
                    Apply Filters
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-muted/80 to-muted/60 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Submission ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {state === "loading" && (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5"><div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-24" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-32" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-28" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-lg w-20" /></td>
                        <td className="px-6 py-5"><div className="h-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg w-20" /></td>
                      </tr>
                    ))}
                  </>
                )}

                {state === "default" && items.map((item) => (
                  <tr key={item.id} data-testid="grading-row" className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 group">
                    <td className="px-6 py-5"><span className="text-sm font-mono text-foreground bg-muted/30 px-3 py-1 rounded-lg">{item.id}</span></td>
                    <td className="px-6 py-5"><span className="text-sm text-foreground font-medium">{item.courseTitle || "—"}</span></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold" aria-hidden>
                          {item.studentName?.charAt(0) || "?"}
                        </div>
                        <span className="text-sm text-foreground font-medium">{item.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <time className="text-sm text-muted-foreground" dateTime={item.submittedAt}>{item.submittedAt}</time>
                    </td>
                    <td className="px-6 py-5">
                      <a href={item.openHref} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 text-sm font-medium group-hover:shadow-md">
                        Grade
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {state === "empty" && (
            <div className="py-16 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4" aria-hidden>
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">All caught up!</h3>
              <p className="text-muted-foreground max-w-md mx-auto">No submissions need grading right now. Try adjusting your filters to find more work, or take a well-deserved break.</p>
            </div>
          )}
        </div>

        {state !== "empty" && (
          <div className="mt-8 flex items-center justify-between bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              {pagination.totalHint && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" aria-hidden />
                  Page {pagination.page} • {pagination.totalHint}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <a
                href={pagination.prevHref || "#"}
                data-testid="grading-prev"
                className={`px-4 py-2 text-sm border border-border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${pagination.prevHref ? "text-foreground hover:bg-primary/10 hover:border-primary/30 hover:shadow-md" : "text-muted-foreground cursor-not-allowed opacity-50"}`}
                aria-disabled={!pagination.prevHref}
                tabIndex={pagination.prevHref ? 0 : -1}
              >
                ← Previous
              </a>
              <a
                href={pagination.nextHref || "#"}
                data-testid="grading-next"
                className={`px-4 py-2 text-sm border border-border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${pagination.nextHref ? "text-foreground hover:bg-primary/10 hover:border-primary/30 hover:shadow-md" : "text-muted-foreground cursor-not-allowed opacity-50"}`}
                aria-disabled={!pagination.nextHref}
                tabIndex={pagination.nextHref ? 0 : -1}
              >
                Next →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


