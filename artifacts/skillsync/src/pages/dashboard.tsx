import { useGetDashboardSummary, useGetRecentActivity, useGetJobMatches, getGetDashboardSummaryQueryKey, getGetRecentActivityQueryKey, getGetJobMatchesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { getAuthHeaders } from "@/lib/api";
import { motion } from "framer-motion";
import { Briefcase, ClipboardList, BookOpen, Bell, TrendingUp, Code2, GraduationCap, Zap, Star, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className={cn("p-4 border border-border rounded-lg bg-card flex items-start gap-3")}>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function MatchScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-secondary rounded-full h-1.5">
        <div className={cn("h-1.5 rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono font-semibold">{score}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const headers = getAuthHeaders();

  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    request: { headers },
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({
    request: { headers },
    query: { queryKey: getGetRecentActivityQueryKey() },
  });

  const { data: matches, isLoading: loadingMatches } = useGetJobMatches({
    request: { headers },
    query: { queryKey: getGetJobMatchesQueryKey() },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} • Lv.{user?.level} • {user?.xp} XP
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)
        ) : (
          <>
            <StatCard label="Open Jobs" value={summary?.stats?.jobs ?? 0} icon={Briefcase} color="bg-blue-500" />
            <StatCard label="My Applications" value={summary?.stats?.applications ?? 0} icon={TrendingUp} color="bg-purple-500" />
            <StatCard label="Assessments Passed" value={summary?.stats?.assessmentsPassed ?? 0} icon={ClipboardList} color="bg-green-500" />
            <StatCard label="Notifications" value={summary?.stats?.unreadNotifications ?? 0} icon={Bell} color="bg-orange-500" />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Job Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              AI Job Matches
            </h2>
            <Link href="/jobs">
              <span className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="space-y-2">
            {loadingMatches ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
            ) : Array.isArray(matches) && matches.slice(0, 4).map((m: { job: { id: number; title: string; company: string; type: string }; matchScore: number; matchedSkills: string[] }, i: number) => (
              <motion.div
                key={m.job.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/jobs/${m.job.id}`}>
                  <div className="p-4 border border-border rounded-lg bg-card hover:border-primary/40 transition-colors cursor-pointer" data-testid={`card-job-match-${m.job.id}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-medium text-sm">{m.job.title}</div>
                        <div className="text-xs text-muted-foreground">{m.job.company}</div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{m.job.type}</Badge>
                    </div>
                    <MatchScoreBadge score={m.matchScore} />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.matchedSkills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Jobs */}
          <div className="flex items-center justify-between mt-6">
            <h2 className="font-semibold">Recent Listings</h2>
          </div>
          <div className="space-y-2">
            {loadingSummary ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)
            ) : summary?.recentJobs?.slice(0, 3).map((job: { id: number; title: string; company: string; type: string; applicantCount: number }) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="p-3 border border-border rounded-lg bg-card hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3" data-testid={`card-recent-job-${job.id}`}>
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{job.title}</div>
                    <div className="text-xs text-muted-foreground">{job.company} • {job.applicantCount} applicants</div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{job.type}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Announcements */}
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" />
              Announcements
            </h2>
            <div className="space-y-2">
              {loadingSummary ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20" />)
              ) : summary?.recentAnnouncements?.map((ann: { id: number; title: string; content: string; type: string }) => (
                <div key={ann.id} className="p-3 border border-border rounded-lg bg-card" data-testid={`card-announcement-${ann.id}`}>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs capitalize flex-shrink-0 mt-0.5">{ann.type}</Badge>
                  </div>
                  <div className="font-medium text-sm mt-1 leading-tight">{ann.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{ann.content}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-1.5">
              {[
                { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
                { href: "/assessments", label: "Take Assessment", icon: ClipboardList },
                { href: "/learning", label: "Learning Hub", icon: BookOpen },
                { href: "/freelance", label: "Freelance Projects", icon: Code2 },
                { href: "/college/forms", label: "College Forms", icon: GraduationCap },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <button className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-sm" data-testid={`button-quick-${item.href.replace(/\//g, "-").slice(1)}`}>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {item.label}
                      <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* XP Progress */}
          <div className="p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium text-sm">Level {user?.level}</span>
            </div>
            <div className="bg-secondary rounded-full h-2 mb-2">
              <div
                className="h-2 bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(100, ((user?.xp ?? 0) % 500) / 5)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-mono">
              <span>{user?.xp} XP</span>
              <span>{500 - ((user?.xp ?? 0) % 500)} to next level</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
