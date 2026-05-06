import { useState } from "react";
import { useListJobs, useGetJobMatches, getListJobsQueryKey, getGetJobMatchesQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Briefcase, MapPin, Clock, Users, Zap, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const jobTypes = [
  { value: "", label: "All Types" },
  { value: "job", label: "Full-time" },
  { value: "internship", label: "Internship" },
  { value: "hackathon", label: "Hackathon" },
  { value: "freelance", label: "Freelance" },
];

function MatchBar({ score }: { score?: number }) {
  if (!score) return null;
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mt-2">
      <Zap className="w-3 h-3 text-primary flex-shrink-0" />
      <div className="flex-1 bg-secondary rounded-full h-1">
        <div className={cn("h-1 rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-muted-foreground">{score}% match</span>
    </div>
  );
}

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const headers = getAuthHeaders();

  const { data: jobsData, isLoading } = useListJobs({ type: type || undefined, search: search || undefined }, {
    request: { headers },
  });

  const { data: matches } = useGetJobMatches({
    request: { headers },
  });

  const matchMap = Array.isArray(matches)
    ? Object.fromEntries(matches.map((m: { job: { id: string }; matchScore: number }) => [m.job.id, m.matchScore]))
    : {};

  const jobs = (jobsData as { jobs?: unknown[] })?.jobs ?? [];

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
                Opportunity Engine
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Jobs & <span className="text-primary">Opportunities</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                {(jobsData as { total?: number })?.total ?? 0} positions optimized for your profile
              </p>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Jobs</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">{(jobsData as { total?: number })?.total ?? 0}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/20" />
            <Input
              placeholder="Search by role, company, or keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-black/5 bg-white/50 backdrop-blur-sm focus:ring-primary/20 focus:border-primary/20 transition-all font-bold"
              data-testid="input-search"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {jobTypes.map(t => (
              <Button
                key={t.value}
                variant={type === t.value ? "default" : "outline"}
                className={cn(
                  "h-14 px-6 rounded-2xl font-bold transition-all whitespace-nowrap",
                  type === t.value 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "border-black/5 bg-white/50 hover:bg-black/5"
                )}
                onClick={() => setType(t.value)}
                data-testid={`filter-type-${t.value || "all"}`}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Job grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)
          ) : (jobs as Array<{ id: string; title: string; company: string; type: string; location?: string; salary?: string; deadline?: string; skills: string[]; applicantCount: number }>).map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/jobs/${job.id}`}>
                <div
                  className="group p-8 rounded-[2.5rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-between"
                  data-testid={`card-job-${job.id}`}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Briefcase className="w-24 h-24 text-primary" />
                  </div>

                  <div>
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                        <Briefcase className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <Badge variant="outline" className="rounded-full border-black/10 group-hover:border-white/20 group-hover:text-white uppercase tracking-widest text-[10px] font-black">
                        {job.type}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-black mb-1 group-hover:text-white transition-colors tracking-tight">{job.title}</h3>
                    <p className="text-black/40 font-bold text-xs mb-6 group-hover:text-white/40 transition-colors uppercase tracking-widest">{job.company}</p>

                    <div className="space-y-3 mb-8">
                      {job.location && (
                        <div className="flex items-center gap-2 text-xs font-bold text-black/40 group-hover:text-white/40">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-bold text-black/40 group-hover:text-white/40">
                        <Users className="w-3.5 h-3.5" />
                        {job.applicantCount} Applicants
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="text-[10px] font-black uppercase tracking-wider bg-black/5 group-hover:bg-white/10 px-2 py-1 rounded-md group-hover:text-white transition-colors">{s}</span>
                      ))}
                    </div>
                    <MatchBar score={matchMap[job.id]} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {!isLoading && (jobs as unknown[]).length === 0 && (
          <div className="text-center py-24 glass-light rounded-[3rem] border-dashed border-2 border-black/5">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-black/10" />
            <h3 className="text-xl font-black mb-2">No matching positions found</h3>
            <p className="text-black/40 font-medium">Try broadening your search or updating your skill profile.</p>
          </div>
        )}
      </div>
    </div>
  );
}
