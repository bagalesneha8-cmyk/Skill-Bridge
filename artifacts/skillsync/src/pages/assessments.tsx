import { useListAssessments, useListAssessmentResults, getListAssessmentsQueryKey, getListAssessmentResultsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { ClipboardList, Clock, ChevronRight, CheckCircle, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = ["All", "Programming", "Computer Science", "Professional", "Mathematics"];
const difficultyColor: Record<string, string> = {
  easy: "text-green-600 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  hard: "text-red-600 bg-red-500/10 border-red-500/30",
};

export default function Assessments() {
  const [category, setCategory] = useState("");
  const headers = getAuthHeaders();

  const { data: assessments, isLoading } = useListAssessments({ category: category || undefined }, {
    request: { headers },
  });

  const { data: results } = useListAssessmentResults(undefined, {
    request: { headers },
  });

  const passedIds = new Set(
    Array.isArray(results)
      ? results.filter((r: { passed: boolean }) => r.passed).map((r: { assessmentId: string }) => r.assessmentId)
      : []
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Assessment Center</h1>
        <p className="text-muted-foreground text-sm mt-1">Prove your skills, earn certificates, and boost your profile.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Available Tests", value: Array.isArray(assessments) ? assessments.length : "—" },
          { label: "Completed", value: Array.isArray(results) ? results.length : 0 },
          { label: "Passed", value: passedIds.size },
        ].map(stat => (
          <div key={stat.label} className="p-3 border border-border rounded-lg bg-card text-center">
            <div className="text-xl font-bold font-mono">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={category === (cat === "All" ? "" : cat) ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat === "All" ? "" : cat)}
            data-testid={`filter-category-${cat.toLowerCase().replace(/\s/g, "-")}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)
        ) : (Array.isArray(assessments) ? assessments : []).map((a: { id: string; title: string; category: string; type: string; difficulty: string; duration: number; questionCount: number }, i: number) => {
          const passed = passedIds.has(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={`/assessments/${a.id}`}>
                <div
                  className={cn(
                    "p-5 border rounded-lg bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full",
                    passed ? "border-green-500/40" : "border-border"
                  )}
                  data-testid={`card-assessment-${a.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {passed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <ClipboardList className="w-5 h-5 text-primary" />}
                    </div>
                    <Badge variant="outline" className={cn("text-xs capitalize border", difficultyColor[a.difficulty])}>
                      {a.difficulty}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-1 leading-tight">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{a.category} • {a.type.toUpperCase()}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.duration} min</span>
                    <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" />{a.questionCount} questions</span>
                  </div>
                  {passed && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-medium">
                      <Trophy className="w-3 h-3" /> Passed — Certificate earned
                    </div>
                  )}
                  {!passed && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                      Start test <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
