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
                Skill Validation
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Assessment <span className="text-primary">Center</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                Verify your expertise and unlock verified badges for your profile.
              </p>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Verified Badges</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">{passedIds.size}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: "Available Tests", value: Array.isArray(assessments) ? assessments.length : "—", icon: ClipboardList, color: "text-blue-600 bg-blue-50" },
            { label: "Completed", value: Array.isArray(results) ? results.length : 0, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
            { label: "Verified Badges", value: passedIds.size, icon: Trophy, color: "text-orange-600 bg-orange-50" },
          ].map(stat => (
            <div key={stat.label} className="p-8 glass-light rounded-[2.5rem] border border-black/5 flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", stat.color)}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={category === (cat === "All" ? "" : cat) ? "default" : "outline"}
              className={cn(
                "h-12 px-6 rounded-2xl font-bold transition-all whitespace-nowrap",
                category === (cat === "All" ? "" : cat)
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "border-black/5 bg-white/50 hover:bg-black/5"
              )}
              onClick={() => setCategory(cat === "All" ? "" : cat)}
              data-testid={`filter-category-${cat.toLowerCase().replace(/\s/g, "-")}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)
          ) : (Array.isArray(assessments) ? assessments : []).map((a: { id: string; title: string; category: string; type: string; difficulty: string; duration: number; questionCount: number }, i: number) => {
            const passed = passedIds.has(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/assessments/${a.id}`}>
                  <div
                    className={cn(
                      "group p-8 rounded-[2.5rem] border transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-between",
                      passed 
                        ? "border-green-500/20 bg-green-50/30 hover:bg-[#030303]" 
                        : "border-black/5 bg-white hover:bg-[#030303]"
                    )}
                    data-testid={`card-assessment-${a.id}`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <Trophy className="w-24 h-24 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          passed ? "bg-green-500/10" : "bg-primary/10 group-hover:bg-primary"
                        )}>
                          {passed ? <CheckCircle className="w-6 h-6 text-green-600" /> : <ClipboardList className="w-6 h-6 text-primary group-hover:text-white" />}
                        </div>
                        <Badge variant="outline" className={cn(
                          "rounded-full uppercase tracking-widest text-[10px] font-black px-3 py-1",
                          passed ? "border-green-500/20 text-green-600" : "border-black/10 group-hover:border-white/20 group-hover:text-white"
                        )}>
                          {a.difficulty}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-black mb-1 group-hover:text-white transition-colors tracking-tight leading-tight">{a.title}</h3>
                      <p className="text-black/40 font-bold text-xs mb-6 group-hover:text-white/40 transition-colors uppercase tracking-widest">{a.category} • {a.type}</p>

                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/30">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{a.duration} MIN</span>
                        <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" />{a.questionCount} Qs</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      {passed ? (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-black uppercase tracking-widest bg-green-500/5 p-3 rounded-2xl border border-green-500/10">
                          <Trophy className="w-4 h-4" /> Certificate Earned
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                          <span>Begin Assessment</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
