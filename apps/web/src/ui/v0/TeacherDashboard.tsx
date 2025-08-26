"use client";

import type React from "react";

export type TeacherDashboardProps = {
  header?: { title?: string; subtitle?: string };
  kpis: Array<{
    id: string;
    label: string;
    value: number | string;
    trend?: "up" | "down" | "flat";
    hint?: string;
  }>;
  quickLinks: Array<{ id: string; label: string; href: string; icon?: string }>;
  recentlyGraded: Array<{
    id: string;
    student: string;
    assignment: string;
    score?: string | null;
    at: string;
    href: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    at: string;
    href?: string;
  }>;
  state?: "default" | "loading" | "empty";
};

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  header = { title: "Teacher Dashboard", subtitle: "Manage your courses and track student progress" },
  kpis = [],
  quickLinks = [],
  recentlyGraded = [],
  notifications = [],
  state = "default",
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTrendIcon = (trend?: "up" | "down" | "flat") => {
    switch (trend) {
      case "up":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </div>
        );
      case "down":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
            </svg>
          </div>
        );
      case "flat":
        return (
          <div className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getQuickLinkIcon = (icon?: string) => {
    const iconClass = "w-6 h-6";
    switch (icon) {
      case "profile":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "course":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "grading":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        );
    }
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-80 animate-pulse" />
            <div className="h-5 bg-muted rounded w-96 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                  <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-muted rounded-lg mx-auto animate-pulse" />
                <div className="h-4 bg-muted rounded w-20 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-6">
                <div className="h-6 bg-muted rounded w-40 mb-6 animate-pulse" />
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{header.title}</h1>
            {header.subtitle && <p className="text-muted-foreground text-lg">{header.subtitle}</p>}
          </div>
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Your Dashboard</h3>
            <p className="text-muted-foreground text-center max-w-md">Get started by creating your first course or setting up your profile. Your teaching journey begins here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{header.title}</h1>
          {header.subtitle && <p className="text-muted-foreground text-lg">{header.subtitle}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.id} data-testid="teacher-kpi" className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</h3>
                {getTrendIcon(kpi.trend)}
              </div>
              <div className="mb-2"><span className="text-3xl font-bold text-foreground">{kpi.value}</span></div>
              {kpi.hint && <p className="text-sm text-muted-foreground">{kpi.hint}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <a key={link.id} href={link.href} data-testid="teacher-quick-link" className="bg-card rounded-lg border p-6 text-center hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  {getQuickLinkIcon(link.icon)}
                </div>
                <span className="font-medium text-foreground">{link.label}</span>
              </div>
            </a>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recently Graded</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
              </div>
            </div>
            {recentlyGraded.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-muted-foreground">No recent grading activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentlyGraded.map((item) => (
                  <a key={item.id} href={item.href} data-testid="teacher-recent-item" className="block p-4 rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-medium text-sm">{item.student.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.student}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.assignment}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.at)}</p>
                        </div>
                      </div>
                      {item.score && (
                        <div className="ml-4 flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">{item.score}</span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{notifications.length} new</span>
                </div>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 17H6l5 5v-5zM12 3v9m0 0l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} data-testid="teacher-notification-item" className="p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    {notification.href ? (
                      <a href={notification.href} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{notification.type.replace(":", " ")}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(notification.at)}</p>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0" aria-hidden>
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{notification.type.replace(":", " ")}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(notification.at)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;


