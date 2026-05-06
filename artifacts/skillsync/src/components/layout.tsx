import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useListNotifications, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import {
  LayoutDashboard, Briefcase, ClipboardList, BookOpen, FileText,
  TrendingUp, Code2, GraduationCap, Bell, Trophy, Users, User,
  LogOut, Menu, X, ChevronRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs & Internships", icon: Briefcase },
  { href: "/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/learning", label: "Learning Hub", icon: BookOpen },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/career", label: "Career Track", icon: TrendingUp },
  { href: "/freelance", label: "Freelance", icon: Code2 },
  { href: "/college/forms", label: "College Forms", icon: GraduationCap },
  { href: "/college/announcements", label: "Announcements", icon: Bell },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/admin", label: "Admin", icon: Users, roles: ["admin"] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const { data: notifications } = useListNotifications({
    request: { headers: getAuthHeaders() },
    query: { queryKey: getListNotificationsQueryKey() },
  });

  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: { read: boolean }) => !n.read).length : 0;

  const filteredNav = navItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role ?? "");
  });

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sidebar-foreground font-bold text-sm leading-tight">SkillSync AI</div>
            <div className="text-sidebar-foreground/50 text-xs font-mono">v2.0</div>
          </div>
          <button className="ml-auto lg:hidden text-sidebar-foreground/60" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sidebar-foreground text-sm font-medium truncate">{user?.name}</div>
              <div className="text-sidebar-foreground/50 text-xs capitalize">{user?.role?.replace("_", " ")}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 bg-sidebar-border rounded-full h-1.5">
              <div
                className="h-1.5 bg-primary rounded-full"
                style={{ width: `${Math.min(100, ((user?.xp ?? 0) % 500) / 5)}%` }}
              />
            </div>
            <span className="text-xs text-sidebar-foreground/50 font-mono">Lv.{user?.level}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {filteredNav.map(item => {
            const active = location === item.href || location.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  data-testid={`nav-${item.href.replace(/\//g, "-").slice(1)}`}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mb-0.5",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.href === "/college/announcements" && unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono">{unreadCount}</span>
                  )}
                  {active && <ChevronRight className="w-3 h-3 opacity-60" />}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <Link href="/profile">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
              <User className="w-4 h-4" />
              Profile
            </button>
          </Link>
          <button
            onClick={logout}
            data-testid="button-logout"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="text-primary font-semibold">{user?.xp ?? 0} XP</span>
            <span>•</span>
            <span>{user?.streak ?? 0}d streak</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
