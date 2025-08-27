import { 
  BookOpen, 
  FileText, 
  Users, 
  GraduationCap, 
  BarChart3, 
  Calendar,
  Trophy,
  Star,
  Settings,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Navigation items based on user role
const getNavigationItems = (role: string) => {
  const commonItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
  ];

  const roleItems = {
    teacher: [
      { title: "Courses", url: "/courses", icon: BookOpen },
      { title: "Assignments", url: "/assignments", icon: FileText },
      { title: "Students", url: "/students", icon: Users },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Grading Queue", url: "/grading", icon: GraduationCap },
    ],
    student: [
      { title: "My Courses", url: "/courses", icon: BookOpen },
      { title: "Assignments", url: "/assignments", icon: FileText },
      { title: "Planner", url: "/planner", icon: Calendar },
      { title: "Timeline", url: "/timeline", icon: Calendar },
      { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
      { title: "Achievements", url: "/achievements", icon: Star },
    ],
    parent: [
      { title: "My Children", url: "/children", icon: Users },
      { title: "Progress", url: "/progress", icon: BarChart3 },
    ],
    admin: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Courses", url: "/courses", icon: BookOpen },
      { title: "System", url: "/admin", icon: Settings },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  };

  return [...commonItems, ...(roleItems[role as keyof typeof roleItems] || [])];
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Get user role from profiles (you'll need to fetch this)
  const userRole = "teacher"; // TODO: Get from user profile data

  const items = getNavigationItems(userRole);

  const collapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          {!collapsed && (
            <span className="font-semibold text-lg">EduPlatform</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={signOut}
            className="mt-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}