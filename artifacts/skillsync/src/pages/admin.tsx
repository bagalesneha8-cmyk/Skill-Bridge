import { useGetPlatformStats, useListUsers, getGetPlatformStatsQueryKey, getListUsersQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Briefcase, ClipboardList, Code2, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const ROLE_COLORS: Record<string, string> = {
  student: "#3b82f6",
  recruiter: "#8b5cf6",
  faculty: "#22c55e",
  freelancer_client: "#f59e0b",
  admin: "#ef4444",
};

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const headers = getAuthHeaders();

  useEffect(() => {
    if (user && user.role !== "admin") {
      setLocation("/dashboard");
    }
  }, [user]);

  const { data: stats, isLoading: loadingStats } = useGetPlatformStats({
    request: { headers },
    query: { queryKey: getGetPlatformStatsQueryKey() },
  });

  const { data: usersData, isLoading: loadingUsers } = useListUsers({
    request: { headers },
    query: { queryKey: getListUsersQueryKey() },
  });

  const s = stats as { totalUsers?: number; totalJobs?: number; totalApplications?: number; totalAssessments?: number; totalFreelanceProjects?: number; usersByRole?: Record<string, number> } | undefined;

  const roleChartData = s?.usersByRole
    ? Object.entries(s.usersByRole).map(([role, count]) => ({ role, count }))
    : [];

  const statCards = [
    { label: "Total Users", value: s?.totalUsers ?? 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Jobs", value: s?.totalJobs ?? 0, icon: Briefcase, color: "bg-purple-500" },
    { label: "Applications", value: s?.totalApplications ?? 0, icon: ClipboardList, color: "bg-green-500" },
    { label: "Freelance Projects", value: s?.totalFreelanceProjects ?? 0, icon: Code2, color: "bg-orange-500" },
  ];

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform overview and user management.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loadingStats ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="p-4 border border-border rounded-lg bg-card flex items-start gap-3" data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${card.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono">{card.value}</div>
                    <div className="text-xs text-muted-foreground">{card.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Users by role chart */}
        <div className="p-5 border border-border rounded-lg bg-card">
          <h2 className="font-semibold mb-4">Users by Role</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roleChartData} barSize={36}>
              <XAxis dataKey="role" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {roleChartData.map(entry => (
                  <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role legend */}
        <div className="p-5 border border-border rounded-lg bg-card">
          <h2 className="font-semibold mb-4">Role Distribution</h2>
          <div className="space-y-3">
            {roleChartData.map(entry => (
              <div key={entry.role} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: ROLE_COLORS[entry.role] ?? "#94a3b8" }} />
                <span className="text-sm capitalize flex-1">{entry.role.replace("_", " ")}</span>
                <span className="font-mono font-semibold text-sm">{entry.count}</span>
                <div className="w-24 bg-secondary rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${s?.totalUsers ? (entry.count / s.totalUsers) * 100 : 0}%`, background: ROLE_COLORS[entry.role] ?? "#94a3b8" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="p-5 border border-border rounded-lg bg-card">
        <h2 className="font-semibold mb-4">All Users</h2>
        {loadingUsers ? <Skeleton className="h-48" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Role</th>
                  <th className="text-left py-2 pr-4">Institution</th>
                  <th className="text-right py-2">XP / Level</th>
                </tr>
              </thead>
              <tbody>
                {((usersData as { users?: Array<{ id: number; name: string; email: string; role: string; institution?: string; xp: number; level: number }> })?.users ?? []).map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors" data-testid={`row-user-${u.id}`}>
                    <td className="py-2 pr-4 font-medium">{u.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{u.email}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline" className="text-xs capitalize" style={{ color: ROLE_COLORS[u.role] }}>
                        {u.role.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{u.institution ?? "—"}</td>
                    <td className="py-2 text-right font-mono">{u.xp} / Lv.{u.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
