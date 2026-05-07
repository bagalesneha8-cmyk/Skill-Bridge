import { 
  useGetLeaderboard, 
  useGetGlobalActivity, 
  useGetCareerStats,
  useGetUserBadges
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Star, Award, Medal, Zap, Flame, 
  TrendingUp, Globe, Users, Briefcase, 
  Brain, Code, CheckCircle2, ChevronRight,
  Activity, BarChart3, Target, Crown, Flag,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

// Categories stay the same for UI structure
const CATEGORIES = [
  { id: "global", label: "Global", icon: Globe },
  { id: "college", label: "College", icon: Users },
  { id: "freelance", label: "Freelance", icon: Briefcase },
  { id: "challenges", label: "AI Challenges", icon: Brain },
  { id: "hackathons", label: "Hackathons", icon: Code },
  { id: "assessments", label: "Assessments", icon: Target },
];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]" />;
  return <span className="text-sm font-black text-white/20 w-6 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("global");
  const headers = getAuthHeaders();

  // Real-time Data Fetching
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useGetLeaderboard({
    request: { headers },
  });

  const { data: globalActivity, isLoading: isActivityLoading } = useGetGlobalActivity({
    request: { headers },
  });

  const { data: myStats } = useGetCareerStats({
    request: { headers },
  });

  const { data: myBadges } = useGetUserBadges({
    request: { headers },
  });

  // Dynamic podium and list
  const podium = useMemo(() => (leaderboardData || []).slice(0, 3), [leaderboardData]);
  const rankings = useMemo(() => (leaderboardData || []).slice(3), [leaderboardData]);

  const isLoading = isLeaderboardLoading || isActivityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white relative pb-20">
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
                Global Standings
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                SkillSync <span className="text-primary">Elite</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                The world's top talent, ranked by verified skills and achievements.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="px-6 py-2">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Your Rank</div>
                  <div className="text-2xl font-black text-primary leading-none mt-1">
                    #{myBadges?.rank || "--"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="px-6 py-2">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Level</div>
                  <div className="text-2xl font-black text-white leading-none mt-1">LV.{myStats?.level || 1}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Main Leaderboard Section */}
          <div className="lg:col-span-8 space-y-10">
            {/* Podium Section */}
            <div className="flex items-end justify-center gap-4 md:gap-8 py-10 relative">
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
              
              {/* Rank 2 */}
              {podium[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center gap-4 flex-1 max-w-[160px]"
                >
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/5 shadow-xl flex items-center justify-center text-2xl font-black text-black/20 group-hover:scale-110 transition-transform">
                      {podium[1].avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-xl flex items-center justify-center border-4 border-white">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black tracking-tight">{podium[1].name.split(" ")[0]}</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">{podium[1].xp?.toLocaleString()} XP</div>
                  </div>
                  <div className="w-full h-32 bg-black/[0.03] rounded-[2.5rem] flex items-center justify-center border border-black/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:from-black/20 transition-all" />
                    <span className="text-black/10 font-black text-4xl relative z-10 group-hover:scale-110 transition-transform">2</span>
                  </div>
                </motion.div>
              )}

              {/* Rank 1 */}
              {podium[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-4 flex-1 max-w-[200px]"
                >
                  <div className="relative">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-[#030303] border-4 border-primary shadow-[0_0_50px_rgba(59,130,246,0.4)] flex items-center justify-center text-4xl font-black text-primary overflow-hidden relative group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                      <span className="relative z-10 group-hover:scale-110 transition-transform">{podium[0].avatar}</span>
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                      <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-bounce" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl flex items-center justify-center border-4 border-[#030303]">
                      <Crown className="w-5 h-5 text-[#030303]" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black tracking-tighter">{podium[0].name.split(" ")[0]}</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{podium[0].xp?.toLocaleString()} XP</div>
                  </div>
                  <div className="w-full h-48 bg-[#030303] rounded-[3rem] flex items-center justify-center border border-white/10 relative overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent group-hover:from-primary/40 transition-all" />
                    <span className="text-white font-black text-6xl relative z-10 group-hover:scale-110 transition-transform">1</span>
                  </div>
                </motion.div>
              )}

              {/* Rank 3 */}
              {podium[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-4 flex-1 max-w-[160px]"
                >
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/5 shadow-xl flex items-center justify-center text-2xl font-black text-black/20 group-hover:scale-110 transition-transform">
                      {podium[2].avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-xl flex items-center justify-center border-4 border-white">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-black tracking-tight">{podium[2].name.split(" ")[0]}</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">{podium[2].xp?.toLocaleString()} XP</div>
                  </div>
                  <div className="w-full h-24 bg-black/[0.03] rounded-[2.5rem] flex items-center justify-center border border-black/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent group-hover:from-black/20 transition-all" />
                    <span className="text-black/10 font-black text-3xl relative z-10 group-hover:scale-110 transition-transform">3</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="global" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start gap-2 bg-transparent h-auto p-0 mb-8 border-b border-black/5 no-scrollbar overflow-x-auto pb-4">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger 
                    key={cat.id}
                    value={cat.id} 
                    className="rounded-2xl border-2 border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/5 px-6 py-3 text-xs font-black uppercase tracking-widest text-black/30 data-[state=active]:text-primary transition-all flex items-center gap-2"
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 outline-none">
                {rankings.map((entry: any, i) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="group flex items-center gap-6 p-6 rounded-[2.5rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-2xl relative overflow-hidden">
                      <div className="w-10 flex items-center justify-center flex-shrink-0">
                        <RankIcon rank={entry.rank} />
                      </div>
                      
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center font-black text-lg border border-black/5 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/10 transition-all">
                          {entry.avatar}
                        </div>
                        {entry.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-lg flex items-center justify-center border-2 border-white group-hover:border-[#030303] transition-colors">
                            <CheckCircle2 className="w-3 h-3 text-[#030303]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-black tracking-tight text-black group-hover:text-white transition-colors truncate">
                            {entry.name}
                          </h4>
                          <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                            {entry.growth}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/40 transition-colors">
                            {entry.role}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black/20 group-hover:text-white/20 transition-colors">
                            <Flag className="w-3 h-3" /> {entry.country}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 items-center text-right flex-shrink-0">
                        <div>
                          <div className="text-lg font-black tracking-tight text-black group-hover:text-primary transition-colors">
                            {entry.xp?.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/20 group-hover:text-white/20">XP</div>
                        </div>
                        <div className="hidden md:block">
                          <div className="text-lg font-black tracking-tight text-black group-hover:text-white transition-colors flex items-center justify-end gap-1.5">
                            <Flame className="w-4 h-4 text-orange-500" /> {entry.streak}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/20 group-hover:text-white/20">STREAK</div>
                        </div>
                        <div>
                          <div className="text-lg font-black tracking-tight text-black group-hover:text-white transition-colors">
                            {entry.skillScore}
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/20 group-hover:text-white/20">SCORE</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Analytics & Activity */}
          <div className="lg:col-span-4 space-y-8">
            {/* XP Analytics */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Your Analytics</h3>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>Level Progress</span>
                    <span className="text-primary">{Math.min(100, (myStats?.xp || 0) % 500 / 5)}%</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (myStats?.xp || 0) % 500 / 5)}%` }} className="h-full bg-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                    <div className="text-xl font-black tracking-tight">{myStats?.learningStreak || 0}</div>
                    <div className="text-[8px] font-black text-black/30 uppercase tracking-widest mt-1">Current Streak</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                    <div className="text-xl font-black tracking-tight">{myStats?.skillScore || 0}%</div>
                    <div className="text-[8px] font-black text-black/30 uppercase tracking-widest mt-1">Skill Mastery</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real Achievement Badges */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Your Badges</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(myBadges?.badges || []).length > 0 ? (myBadges.badges.map((badge: any) => (
                  <div key={badge.id} className="group p-4 rounded-2xl bg-white border border-black/5 hover:border-primary/30 transition-all text-center space-y-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 bg-primary/10 text-primary")}>
                      <Star className="w-5 h-5" />
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-widest leading-tight">
                      {badge.name}
                    </div>
                  </div>
                ))) : (
                  <div className="col-span-2 py-10 text-center text-black/20 text-[10px] font-black uppercase tracking-widest">
                    No badges earned yet
                  </div>
                )}
              </div>
            </motion.div>

            {/* Real Live Activity Feed */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Live Activity</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>

              <div className="space-y-6">
                {(globalActivity || []).map((activity: any) => (
                  <div key={activity.id} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-black/[0.02] border border-black/5 flex items-center justify-center shrink-0 group-hover:text-primary transition-colors">
                      {activity.type === "assessment" ? <Zap className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-[10px] font-bold text-black/60 leading-relaxed">
                        <span className="font-black text-black group-hover:text-primary transition-colors">{activity.user}</span> {activity.action} <span className="font-black text-[#030303]">{activity.target}</span>
                      </p>
                      <div className="text-[8px] font-black uppercase tracking-widest text-black/20">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-black/30 hover:text-primary transition-colors">
                View All Activity <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

