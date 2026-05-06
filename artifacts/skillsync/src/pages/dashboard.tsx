import { useGetDashboardSummary, useGetRecentActivity, useGetJobMatches, getGetDashboardSummaryQueryKey, getGetRecentActivityQueryKey, getGetJobMatchesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { getAuthHeaders } from "@/lib/api";
import { motion } from "framer-motion";
import { Briefcase, ClipboardList, BookOpen, Bell, TrendingUp, Code2, GraduationCap, Zap, Star, ChevronRight, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <div className={cn("group p-6 glass-light rounded-3xl border border-black/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-black/5 transition-all flex flex-col gap-4")}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", color.replace("bg-", "bg-opacity-10 text-").replace("500", "600"))}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <div className="text-xs font-bold text-black/40 uppercase tracking-widest mt-1">{label}</div>
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
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white relative">
      {/* Universal Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 space-y-12 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-[#030303] text-white p-10 md:p-16 shadow-2xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full mb-6 border border-primary/20">
                Next-Gen Career Intelligence
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                {getGreeting()}, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4 flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            
            <div className="flex items-center gap-4 glass-dark p-3 rounded-[2rem] border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2 border-r border-white/10">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Platform Level</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">Lv.{user?.level}</div>
              </div>
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total XP</div>
                <div className="text-2xl font-black text-white leading-none mt-1">{user?.xp}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)
          ) : (
            <>
              <StatCard label="Open Jobs" value={summary?.stats?.jobs ?? 0} icon={Briefcase} color="bg-blue-500" />
              <StatCard label="Applications" value={summary?.stats?.applications ?? 0} icon={TrendingUp} color="bg-purple-500" />
              <StatCard label="Assessments" value={summary?.stats?.assessmentsPassed ?? 0} icon={ClipboardList} color="bg-green-500" />
              <StatCard label="Notifications" value={summary?.stats?.unreadNotifications ?? 0} icon={Bell} color="bg-orange-500" />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Job Matches */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  AI Job Matches
                </h2>
                <Link href="/jobs">
                  <Button variant="link" className="text-primary font-bold gap-1 p-0 h-auto">
                    View all <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {loadingSummary ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
                ) : summary?.topMatches?.map((m: any, i: number) => (
                  <motion.div
                    key={m.job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/jobs/${m.job.id}`}>
                      <div className="group p-8 rounded-[2.5rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                          <Briefcase className="w-24 h-24 text-primary" />
                        </div>
                        
                        <div>
                          <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                              <Briefcase className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                            </div>
                            <Badge variant="outline" className="rounded-full border-black/10 group-hover:border-white/20 group-hover:text-white">
                              {m.job.type}
                            </Badge>
                          </div>
                          
                          <h3 className="text-xl font-black mb-1 group-hover:text-white transition-colors">{m.job.title}</h3>
                          <p className="text-black/40 font-bold text-sm mb-6 group-hover:text-white/40 transition-colors uppercase tracking-widest">{m.job.company}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest group-hover:text-white/60">
                            <span>Match Score</span>
                            <span className="text-primary">{m.matchScore}%</span>
                          </div>
                          <MatchScoreBadge score={m.matchScore} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Jobs */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">Recent Listings</h2>
              <div className="space-y-4">
                {loadingSummary ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />)
                ) : summary?.recentJobs?.slice(0, 3).map((job: any) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="group p-6 rounded-3xl border border-black/5 bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-black/5 transition-all flex items-center gap-6">
                      <div className="w-14 h-14 bg-black/[0.02] rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Briefcase className="w-6 h-6 text-black/20 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-lg truncate group-hover:text-primary transition-colors">{job.title}</h4>
                        <p className="text-black/40 font-bold text-xs uppercase tracking-widest mt-1">{job.company} • {job.applicantCount} applicants</p>
                      </div>
                      <Badge variant="outline" className="rounded-full font-bold px-4 py-1">{job.type}</Badge>
                      <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                        <ChevronRight className="w-5 h-5 text-black/20 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="space-y-12">
            {/* Quick Actions */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest text-black/20 text-sm">Engineered Tools</h2>
              <div className="grid gap-3">
                {[
                  { href: "/jobs", label: "Browse Jobs", icon: Briefcase },
                  { href: "/assessments", label: "Take Assessment", icon: ClipboardList },
                  { href: "/learning", label: "Learning Hub", icon: BookOpen },
                  { href: "/freelance", label: "Freelance Hub", icon: Code2 },
                  { href: "/college/forms", label: "Institutional Forms", icon: GraduationCap },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link href={item.href}>
                        <button className="w-full group flex items-center gap-4 p-5 rounded-3xl border border-black/5 bg-white hover:bg-[#030303] hover:shadow-2xl transition-all duration-500">
                          <div className="w-12 h-12 bg-black/[0.02] rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Icon className="w-6 h-6 text-black/20 group-hover:text-white transition-colors" />
                          </div>
                          <span className="font-black text-lg group-hover:text-white transition-colors">{item.label}</span>
                          <ChevronRight className="w-5 h-5 ml-auto text-black/10 group-hover:text-white transition-colors" />
                        </button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* XP Progress Card */}
            <div className="p-8 rounded-[3rem] bg-[#030303] text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <Badge className="bg-primary text-white font-black px-4 py-1">RANK #42</Badge>
                </div>
                
                <div>
                  <h4 className="text-3xl font-black tracking-tight mb-2">Level {user?.level}</h4>
                  <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Growth Progress</p>
                </div>

                <div className="space-y-3">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((user?.xp ?? 0) % 500) / 5)}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>{user?.xp} XP Total</span>
                    <span>{500 - ((user?.xp ?? 0) % 500)} TO Lv.{user?.level + 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest text-black/20 text-sm">Global Updates</h2>
              <div className="space-y-4">
                {loadingSummary ? (
                  Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
                ) : summary?.recentAnnouncements?.map((ann: any) => (
                  <div key={ann.id} className="p-6 rounded-3xl border border-black/5 bg-white hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      <Badge variant="secondary" className="rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600">
                        {ann.type}
                      </Badge>
                    </div>
                    <h4 className="font-black text-lg leading-tight mb-2">{ann.title}</h4>
                    <p className="text-black/40 text-sm font-medium line-clamp-2">{ann.content}</p>
                  </div>
                ))}
              </div>
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
