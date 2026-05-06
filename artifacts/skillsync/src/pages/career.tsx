import { useGetCareerStats, useGetCareerTimeline, useGetUserBadges, getGetCareerStatsQueryKey, getGetCareerTimelineQueryKey, getGetUserBadgesQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Trophy, Star, Flame, Award, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  shortlisted: "#3b82f6",
  rejected: "#ef4444",
  hired: "#22c55e",
};

export default function Career() {
  const headers = getAuthHeaders();

  const { data: stats, isLoading: loadingStats } = useGetCareerStats({
    request: { headers },
    query: { queryKey: getGetCareerStatsQueryKey() },
  });

  const { data: timeline, isLoading: loadingTimeline } = useGetCareerTimeline({
    request: { headers },
    query: { queryKey: getGetCareerTimelineQueryKey() },
  });

  const { data: gamification, isLoading: loadingBadges } = useGetUserBadges({
    request: { headers },
    query: { queryKey: getGetUserBadgesQueryKey() },
  });

  const s = stats as { appliedJobs?: number; interviews?: number; freelanceProjects?: number; skillScore?: number; certificatesEarned?: number; learningStreak?: number; xp?: number; level?: number; applicationsByStatus?: Record<string, number> } | undefined;
  const g = gamification as { xp?: number; level?: number; badges?: Array<{ id: number; name: string; description: string; icon: string }>; rank?: number } | undefined;

  const pieData = s?.applicationsByStatus
    ? Object.entries(s.applicationsByStatus).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
    : [];

  const barData = [
    { label: "Applied", value: s?.appliedJobs ?? 0 },
    { label: "Interviews", value: s?.interviews ?? 0 },
    { label: "Freelance", value: s?.freelanceProjects ?? 0 },
    { label: "Certs", value: s?.certificatesEarned ?? 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Career Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Your complete career progress, tracked and visualized.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {loadingStats ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />) : (
              <>
                <div className="p-4 border border-border rounded-lg bg-card text-center">
                  <div className="text-2xl font-bold font-mono text-primary">{s?.appliedJobs ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Jobs Applied</div>
                </div>
                <div className="p-4 border border-border rounded-lg bg-card text-center">
                  <div className="text-2xl font-bold font-mono text-blue-500">{s?.skillScore ?? 0}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Skill Score</div>
                </div>
                <div className="p-4 border border-border rounded-lg bg-card text-center">
                  <div className="text-2xl font-bold font-mono text-green-500">{s?.certificatesEarned ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Certificates</div>
                </div>
              </>
            )}
          </div>

          {/* Bar chart */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-4">Activity Overview</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} barSize={32}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Application status pie */}
          {pieData.length > 0 && (
            <div className="p-5 border border-border rounded-lg bg-card">
              <h2 className="font-semibold mb-4">Applications by Status</h2>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {pieData.map(entry => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? "#94a3b8" }} />
                      <span className="capitalize text-muted-foreground">{entry.name}</span>
                      <span className="font-mono font-semibold ml-auto">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-4">Activity Timeline</h2>
            {loadingTimeline ? <Skeleton className="h-40" /> : (
              <div className="space-y-3">
                {Array.isArray(timeline) && timeline.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">No activity yet. Apply to jobs and take assessments to build your timeline.</p>
                )}
                {Array.isArray(timeline) && timeline.map((event: { id: number; type: string; title: string; description: string; date: string }) => (
                  <div key={event.id} className="flex items-start gap-3" data-testid={`timeline-event-${event.id}`}>
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      {event.type === "application" ? <Briefcase className="w-4 h-4 text-primary" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.description}</div>
                      <div className="text-xs text-muted-foreground/60 mt-0.5">{new Date(event.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: gamification */}
        <div className="space-y-4">
          {/* XP & Level */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold">XP & Level</span>
            </div>
            {loadingBadges ? <Skeleton className="h-24" /> : (
              <>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold font-mono text-primary">{g?.level ?? 1}</div>
                  <div className="text-xs text-muted-foreground">Current Level</div>
                </div>
                <div className="text-sm mb-1 flex justify-between">
                  <span>{g?.xp ?? 0} XP</span>
                  <span className="text-muted-foreground">{500 - ((g?.xp ?? 0) % 500)} to next</span>
                </div>
                <div className="bg-secondary rounded-full h-2 mb-3">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min(100, ((g?.xp ?? 0) % 500) / 5)}%` }} />
                </div>
                {g?.rank && (
                  <div className="text-center text-xs text-muted-foreground">
                    Ranked <span className="font-bold text-primary">#{g.rank}</span> on the leaderboard
                  </div>
                )}
              </>
            )}
          </div>

          {/* Streak */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">Learning Streak</span>
            </div>
            <div className="text-4xl font-bold font-mono text-orange-500 text-center">{s?.learningStreak ?? 0}</div>
            <div className="text-xs text-muted-foreground text-center mt-1">days</div>
          </div>

          {/* Badges */}
          <div className="p-5 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">Badges</span>
            </div>
            {loadingBadges ? <Skeleton className="h-32" /> : (
              g?.badges && g.badges.length > 0 ? (
                <div className="space-y-2">
                  {g.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-2 bg-secondary rounded-lg" data-testid={`badge-${badge.id}`}>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{badge.name}</div>
                        <div className="text-xs text-muted-foreground">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-2">No badges yet. Complete assessments and apply to jobs!</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
