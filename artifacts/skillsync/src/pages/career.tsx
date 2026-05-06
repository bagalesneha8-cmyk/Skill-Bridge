import { useGetCareerStats, useGetCareerTimeline, useGetUserBadges, getGetCareerStatsQueryKey, getGetCareerTimelineQueryKey, getGetUserBadgesQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Trophy, Star, Flame, Award, Briefcase, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
                Growth Intelligence
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Career <span className="text-primary">Analytics</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                Your professional trajectory, visualized and optimized by AI.
              </p>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Skill Score</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">{s?.skillScore ?? 0}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {loadingStats ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[2rem]" />) : (
                <>
                  <div className="p-8 glass-light rounded-[2rem] border border-black/5 flex flex-col justify-center text-center group hover:bg-[#030303] transition-all duration-500">
                    <div className="text-3xl font-black tracking-tight group-hover:text-white transition-colors">{s?.appliedJobs ?? 0}</div>
                    <div className="text-[10px] font-black text-black/30 group-hover:text-white/40 uppercase tracking-widest mt-1">Jobs Applied</div>
                  </div>
                  <div className="p-8 glass-light rounded-[2rem] border border-black/5 flex flex-col justify-center text-center group hover:bg-[#030303] transition-all duration-500">
                    <div className="text-3xl font-black tracking-tight text-primary group-hover:text-primary transition-colors">{s?.skillScore ?? 0}%</div>
                    <div className="text-[10px] font-black text-black/30 group-hover:text-white/40 uppercase tracking-widest mt-1">Skill Score</div>
                  </div>
                  <div className="p-8 glass-light rounded-[2rem] border border-black/5 flex flex-col justify-center text-center group hover:bg-[#030303] transition-all duration-500">
                    <div className="text-3xl font-black tracking-tight text-green-600 group-hover:text-green-500 transition-colors">{s?.certificatesEarned ?? 0}</div>
                    <div className="text-[10px] font-black text-black/30 group-hover:text-white/40 uppercase tracking-widest mt-1">Certificates</div>
                  </div>
                </>
              )}
            </div>

            {/* Activity Chart */}
            <div className="p-10 rounded-[3rem] border border-black/5 bg-white hover:shadow-2xl transition-all">
              <h2 className="text-xl font-black mb-10 tracking-tight uppercase tracking-widest text-black/20 text-sm">Activity Overview</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barSize={40}>
                  <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.05)", borderRadius: 16, fontSize: 12, fontWeight: 900 }} 
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 8, 8]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Application status pie */}
            {pieData.length > 0 && (
              <div className="p-10 rounded-[3rem] border border-black/5 bg-white hover:shadow-2xl transition-all">
                <h2 className="text-xl font-black mb-10 tracking-tight uppercase tracking-widest text-black/20 text-sm">Application Status</h2>
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="w-full max-w-[200px]">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                          {pieData.map((entry) => (
                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? "#94a3b8"} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 flex-1">
                    {pieData.map(entry => (
                      <div key={entry.name} className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-lg flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] ?? "#94a3b8" }} />
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/30">{entry.name}</div>
                          <div className="text-xl font-black">{entry.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-6">
              <h2 className="text-xl font-black tracking-tight uppercase tracking-widest text-black/20 text-sm">Activity Timeline</h2>
              {loadingTimeline ? <Skeleton className="h-48 rounded-[3rem]" /> : (
                <div className="space-y-4">
                  {Array.isArray(timeline) && timeline.length === 0 && (
                    <div className="p-12 text-center glass-light rounded-[3rem] border-dashed border-2 border-black/5">
                      <p className="text-black/40 font-bold uppercase tracking-widest text-xs">No recent activity detected.</p>
                    </div>
                  )}
                  {Array.isArray(timeline) && timeline.map((event: any, i: number) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-6 rounded-3xl border border-black/5 bg-white hover:border-primary/20 hover:shadow-xl transition-all flex items-center gap-6"
                      data-testid={`timeline-event-${event.id}`}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border",
                        event.type === "application" ? "bg-primary/5 text-primary border-primary/10" : "bg-green-500/5 text-green-600 border-green-500/10"
                      )}>
                        {event.type === "application" ? <Briefcase className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-lg leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                        <p className="text-black/40 font-bold text-xs uppercase tracking-widest mt-1">{event.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/20">{new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-10">
            {/* XP & Level Card */}
            <div className="p-10 rounded-[3rem] bg-[#030303] text-white relative overflow-hidden shadow-2xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <Star className="w-7 h-7 text-primary fill-primary" />
                  </div>
                  {g?.rank && <Badge className="bg-primary text-white font-black px-4 py-1 uppercase tracking-widest text-[10px]">RANK #{g.rank}</Badge>}
                </div>
                
                <div>
                  <h4 className="text-4xl font-black tracking-tight mb-2 leading-none">Level {g?.level ?? 1}</h4>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Growth Milestone</p>
                </div>

                <div className="space-y-4">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((g?.xp ?? 0) % 500) / 5)}%` }}
                      className="h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                    <span>{g?.xp ?? 0} XP TOTAL</span>
                    <span>{500 - ((g?.xp ?? 0) % 500)} TO LV.{ (g?.level ?? 1) + 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak Card */}
            <div className="p-8 rounded-[2.5rem] border border-black/5 bg-white text-center group hover:bg-[#030303] transition-all duration-500">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500/20 transition-colors">
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-5xl font-black mb-1 group-hover:text-white transition-colors">{s?.learningStreak ?? 0}</div>
              <div className="text-[10px] font-black text-black/30 group-hover:text-white/40 uppercase tracking-[0.2em]">Day Learning Streak</div>
            </div>

            {/* Badges */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight uppercase tracking-widest text-black/20 text-sm">Earned Badges</h2>
              <div className="grid gap-4">
                {loadingBadges ? <Skeleton className="h-48 rounded-[2.5rem]" /> : (
                  g?.badges && g.badges.length > 0 ? (
                    g.badges.map((badge: any) => (
                      <div key={badge.id} className="group p-6 glass-light rounded-3xl border border-black/5 flex items-center gap-6 hover:bg-[#030303] transition-all duration-500" data-testid={`badge-${badge.id}`}>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors border border-primary/10">
                          <Trophy className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <div className="text-lg font-black leading-tight group-hover:text-white transition-colors">{badge.name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/40 mt-1">{badge.description}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center glass-light rounded-[3rem] border-dashed border-2 border-black/5">
                      <Award className="w-12 h-12 mx-auto mb-4 text-black/5" />
                      <p className="text-black/30 font-black uppercase tracking-widest text-[10px]">Unlock badges via assessments</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
