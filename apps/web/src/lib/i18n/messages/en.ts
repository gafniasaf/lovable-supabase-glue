const en = {
  header: {
    home: "Home",
    dashboard: "Dashboard"
  },
  nav: {
    groups: { student: "Student", teacher: "Teacher", admin: "Admin" },
    notifications: "Notifications",
    settings: "Settings",
    messages: "Messages",
    student: { dashboard: "Dashboard", plan: "Planner", timeline: "Timeline" },
    teacher: { dashboard: "Dashboard", gradingQueue: "Grading queue", enrollments: "Enrollments" },
    admin: { dashboard: "Dashboard", users: "Users", roles: "Roles", flags: "Feature Flags", health: "System health", reports: "Reports", parentLinks: "Parent Links", audit: "Audit logs", providers: "Providers", catalog: "Catalog" }
  },
  admin: {
    providers: {
      title: "Course providers",
      columns: { name: "Name", domain: "Domain", jwksUrl: "JWKS URL", health: "Health", created: "Created", actions: "Actions" },
      buttons: { refresh: "Refresh", checkHealth: "Check health" },
      hint: { jwksReachable: "JWKS reachable? Check logs" },
      empty: "No providers yet.",
      add: "Add provider"
    },
    parentLinks: {
      title: "Admin: Parent Links",
      tip: "Tip: append ?parent_id=... to the URL",
      provideHint: "Provide a parent_id via the query string to view links.",
      columns: { student: "Student", actions: "Actions" },
      empty: "No links yet."
    }
  },
  common: {
    back: "Back",
    save: "Save",
    add: "Add",
    remove: "Remove",
    load: "Load",
    apply: "Apply",
    seed: "Seed",
    language: "Language",
    role: "Role",
    menu: "Menu",
    navigation: "Navigation",
    close: "Close",
    create: "Create",
    delete: "Delete",
    creating: "Creating...",
    languageOptions: { en: "EN", es: "ES" },
    openInbox: "Open inbox",
    skipToMain: "Skip to main",
    prev: "Prev",
    next: "Next",
    backToCourses: "Back to courses"
  },
  settings: {
    title: "Settings",
    notifications: "Notification preferences",
    save: "Save",
    profile: "Profile"
  },
  settings_profile: {
    name: "Name",
    bio: "Bio"
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all read",
    empty: "No notifications",
    markRead: "Mark read"
  },
  roles: {
    anon: "anonymous",
    teacher: "teacher",
    student: "student",
    parent: "parent",
    admin: "admin"
  },
  auth: {
    signin: "Sign in",
    notSignedIn: "You are not signed in."
  },
  dashboard: {
    title: "Dashboard",
    student: "Student dashboard",
    teacher: "Your courses",
    admin: "Admin dashboard"
  },
  teacher: {
    newCourse: {
      title: "Create course",
      created: "Created!",
      launchKind: "Launch kind (optional)",
      launchKindOptions: {
        none: "None (standard)",
        webEmbed: "WebEmbed (iframe)",
        remoteContainer: "RemoteContainer (future)",
        streamedDesktop: "StreamedDesktop (future)"
      },
      launchUrl: "Launch URL (optional)",
      provider: "Provider (optional)",
      providerOptions: { none: "None" },
      scopes: "Scopes (optional)",
      scopeOptions: {
        progressWrite: "progress.write",
        progressRead: "progress.read",
        attemptsWrite: "attempts.write",
        attemptsRead: "attempts.read",
        filesRead: "files.read",
        filesWrite: "files.write"
      }
    }
  },
  actions: {
    downloadCsv: "Download CSV"
  }
} as const;

export default en;


