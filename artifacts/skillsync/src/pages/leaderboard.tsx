import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Trophy, Star, Award, Medal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" /> Leaderboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Top learners and career achievers on SkillSync AI.</p>
      </div>

      {/* Top 3 podium */}
      {!isLoading && Array.isArray(leaderboard) && leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry: { userId: string; name: string; xp: number; level: number; badges: number; rank: number }, i: number) => {
            const heights = ["h-24", "h-32", "h-20"];
            const colors = ["bg-gray-200", "bg-yellow-400", "bg-amber-500"];
            return (
              <div key={entry.userId} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold border-2 border-primary/20">
                  {entry.name?.[0]?.toUpperCase()}
                </div>
                <div className="text-sm font-medium">{entry.name?.split(" ")[0]}</div>
                <div className="text-xs text-muted-foreground font-mono">{entry.xp} XP</div>
                <div className={cn("w-16 rounded-t-lg flex items-center justify-center", heights[i], colors[i])}>
                  <span className="text-white font-bold text-sm">{entry.rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {isLoading ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16" />) :
          (Array.isArray(leaderboard) ? leaderboard : []).map((entry: { userId: string; name: string; xp: number; level: number; badges: number; rank: number }, i: number) => {
            const isMe = user?.id === entry.userId;
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 border rounded-lg transition-colors",
                    isMe ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                  data-testid={`leaderboard-entry-${entry.userId}`}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    <RankIcon rank={entry.rank} />
                  </div>
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {entry.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm flex items-center gap-2">
                      {entry.name}
                      {isMe && <span className="text-xs text-primary font-semibold">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">Level {entry.level} • {entry.badges} badges</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-primary text-sm">{entry.xp}</div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
