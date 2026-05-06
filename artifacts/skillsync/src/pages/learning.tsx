import { useGetLearningRecommendations, useGetLearningProgress, useGetLearningRoadmap, useUpdateLearningProgress, getGetLearningRecommendationsQueryKey, getGetLearningProgressQueryKey, getGetLearningRoadmapQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { BookOpen, CheckCircle, ExternalLink, Flame, Target, ChevronRight, Play, FileText, Youtube, Globe, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const priorityColor: Record<string, string> = {
  high: "text-red-600 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  low: "text-green-600 bg-green-500/10 border-green-500/30",
};

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  course: Play,
  youtube: Youtube,
  documentation: FileText,
  platform: Globe,
  roadmap: Map,
};

export default function Learning() {
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"recommendations" | "roadmap">("recommendations");

  const { data: recommendations, isLoading: loadingRecs } = useGetLearningRecommendations({
    request: { headers },
  });

  const { data: progress, isLoading: loadingProgress } = useGetLearningProgress({
    request: { headers },
  });

  const { data: roadmap } = useGetLearningRoadmap({
    request: { headers },
  });

  const updateProgress = useUpdateLearningProgress();

  function markComplete(id: string) {
    updateProgress.mutate({ data: { recommendationId: id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLearningProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLearningRecommendationsQueryKey() });
        toast({ title: "Progress updated!", description: "+10 XP earned." });
      },
    });
  }

  const recs = Array.isArray(recommendations) ? recommendations : [];
  const completedIds = new Set(Array.isArray((progress as { completedIds?: string[] })?.completedIds) ? (progress as { completedIds: string[] }).completedIds : []);
  const prog = progress as { streak?: number; completedItems?: number; totalItems?: number; weeklyCompleted?: number; weeklyGoal?: number } | undefined;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Learning Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalized learning paths curated by AI for your career goals.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {loadingProgress ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) : (
          <>
            <div className="p-4 border border-border rounded-lg bg-card flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500 flex-shrink-0" />
              <div>
                <div className="text-2xl font-bold font-mono">{prog?.streak ?? 0}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="text-2xl font-bold font-mono">{prog?.completedItems ?? 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="text-2xl font-bold font-mono">{prog?.totalItems ?? recs.length}</div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="text-sm font-semibold mb-1">Weekly Goal</div>
              <div className="bg-secondary rounded-full h-1.5 mb-1">
                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min(100, ((prog?.weeklyCompleted ?? 0) / (prog?.weeklyGoal ?? 5)) * 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground font-mono">{prog?.weeklyCompleted ?? 0}/{prog?.weeklyGoal ?? 5}</div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ id: "recommendations", label: "Recommendations" }, { id: "roadmap", label: "Career Roadmap" }].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "recommendations" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingRecs ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)
          ) : recs.map((rec: { id: number; skill: string; title: string; type: string; url: string; provider: string; duration?: string; priority: string; completed: boolean }, i: number) => {
            const completed = rec.completed || completedIds.has(rec.id);
            const Icon = typeIcon[rec.type] ?? BookOpen;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className={cn("p-4 border rounded-lg bg-card h-full flex flex-col", completed ? "border-green-500/40 opacity-75" : "border-border")} data-testid={`card-rec-${rec.id}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">{rec.skill}</div>
                      <div className="font-medium text-sm leading-tight line-clamp-2">{rec.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={cn("text-xs border capitalize", priorityColor[rec.priority])}>
                      {rec.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{rec.provider}</span>
                    {rec.duration && <span className="text-xs text-muted-foreground">• {rec.duration}</span>}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <a href={rec.url} target="_blank" rel="noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs" data-testid={`link-rec-${rec.id}`}>
                        <ExternalLink className="w-3 h-3" /> Open
                      </Button>
                    </a>
                    {!completed && (
                      <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => markComplete(rec.id)} data-testid={`button-complete-${rec.id}`}>
                        <CheckCircle className="w-3 h-3" /> Done
                      </Button>
                    )}
                    {completed && (
                      <div className="flex items-center gap-1 text-xs text-green-600 px-2">
                        <CheckCircle className="w-3 h-3" /> Done
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-2xl">
          <div className="space-y-3">
            {((roadmap as { stages?: Array<{ stage: number; title: string; skills: string[]; completed: boolean }> })?.stages ?? []).map((stage, i) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn("p-5 border rounded-lg bg-card", stage.completed ? "border-green-500/40" : "border-border")}
                data-testid={`roadmap-stage-${stage.stage}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", stage.completed ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground")}>
                    {stage.completed ? <CheckCircle className="w-4 h-4" /> : stage.stage}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{stage.title}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {stage.skills.map(s => (
                        <span key={s} className="text-xs bg-secondary px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  {!stage.completed && i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
