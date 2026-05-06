import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Trophy, Star, Award, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-mono font-bold text-muted-foreground w-5 text-center">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const headers = getAuthHeaders();

  const { data: leaderboard, isLoading } = useGetLeaderboard({
    request: { headers },
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
                Global Standings
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                SkillSync <span className="text-primary">Elite</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                The world's top talent, ranked by verified skills and achievements.
              </p>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Rank</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">#42</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top 3 podium */}
        {!isLoading && Array.isArray(leaderboard) && leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 md:gap-8 py-12 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            
            {/* Rank 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-4 flex-1 max-w-[160px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 shadow-xl flex items-center justify-center text-xl font-black text-black/20">
                {leaderboard[1].name?.[0]?.toUpperCase()}
              </div>
              <div className="text-center">
                <div className="text-sm font-black tracking-tight">{leaderboard[1].name?.split(" ")[0]}</div>
                <div className="text-[10px] font-black text-black/30 uppercase tracking-widest">{leaderboard[1].xp} XP</div>
              </div>
              <div className="w-full h-32 bg-black/[0.03] rounded-2xl flex items-center justify-center border border-black/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                <span className="text-black/20 font-black text-3xl relative z-10">2</span>
              </div>
            </motion.div>

            {/* Rank 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 flex-1 max-w-[200px]"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-white border-2 border-primary shadow-[0_0_40px_rgba(59,130,246,0.3)] flex items-center justify-center text-3xl font-black text-primary overflow-hidden">
                  {leaderboard[0].name?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-500 drop-shadow-lg animate-float" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black tracking-tight">{leaderboard[0].name?.split(" ")[0]}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{leaderboard[0].xp} XP</div>
              </div>
              <div className="w-full h-48 bg-[#030303] rounded-3xl flex items-center justify-center border border-white/10 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                <span className="text-white font-black text-5xl relative z-10">1</span>
              </div>
            </motion.div>

            {/* Rank 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4 flex-1 max-w-[160px]"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 shadow-xl flex items-center justify-center text-xl font-black text-black/20">
                {leaderboard[2].name?.[0]?.toUpperCase()}
              </div>
              <div className="text-center">
                <div className="text-sm font-black tracking-tight">{leaderboard[2].name?.split(" ")[0]}</div>
                <div className="text-[10px] font-black text-black/30 uppercase tracking-widest">{leaderboard[2].xp} XP</div>
              </div>
              <div className="w-full h-24 bg-black/[0.03] rounded-2xl flex items-center justify-center border border-black/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                <span className="text-black/20 font-black text-2xl relative z-10">3</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Full list */}
        <div className="max-w-3xl mx-auto space-y-3">
          {isLoading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-3xl" />) :
            (Array.isArray(leaderboard) ? leaderboard : []).map((entry: any, i: number) => {
              const isMe = user?.id === entry.userId;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={cn(
                      "group flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300",
                      isMe 
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/5" 
                        : "border-black/5 bg-white hover:bg-[#030303] hover:shadow-2xl"
                    )}
                    data-testid={`leaderboard-entry-${entry.userId}`}
                  >
                    <div className="w-10 flex items-center justify-center flex-shrink-0">
                      <RankIcon rank={entry.rank} />
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 border transition-colors",
                      isMe ? "bg-primary text-white border-primary" : "bg-black/5 text-black/20 border-black/5 group-hover:bg-white/10 group-hover:text-white group-hover:border-white/10"
                    )}>
                      {entry.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-lg font-black tracking-tight flex items-center gap-3 transition-colors", isMe ? "text-[#030303]" : "text-black group-hover:text-white")}>
                        {entry.name}
                        {isMe && <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">YOU</Badge>}
                      </div>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest mt-1 transition-colors", isMe ? "text-primary" : "text-black/30 group-hover:text-white/40")}>
                        Level {entry.level} • {entry.badges} Badges
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={cn("text-xl font-black tracking-tight transition-colors", isMe ? "text-primary" : "text-black group-hover:text-primary")}>{entry.xp.toLocaleString()}</div>
                      <div className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", isMe ? "text-primary/50" : "text-black/20 group-hover:text-white/20")}>Total XP</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
