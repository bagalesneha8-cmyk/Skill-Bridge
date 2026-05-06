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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Jobs & Opportunities</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {(jobsData as { total?: number })?.total ?? 0} open positions matched to your skills
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <div className="flex gap-2">
          {jobTypes.map(t => (
            <Button
              key={t.value}
              variant={type === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => setType(t.value)}
              data-testid={`filter-type-${t.value || "all"}`}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Job grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)
        ) : (jobs as Array<{ id: string; title: string; company: string; type: string; location?: string; salary?: string; deadline?: string; skills: string[]; applicantCount: number }>).map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/jobs/${job.id}`}>
              <div
                className="p-5 border border-border rounded-lg bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full"
                data-testid={`card-job-${job.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize flex-shrink-0">{job.type}</Badge>
                </div>

                <div className="space-y-1 mb-3">
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="w-3 h-3" />
                      {job.salary}
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Deadline: {job.deadline}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {job.applicantCount} applicants
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {job.skills.slice(0, 4).map((s: string) => (
                    <span key={s} className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{s}</span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{job.skills.length - 4}</span>
                  )}
                </div>

                <MatchBar score={matchMap[job.id]} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {!isLoading && (jobs as unknown[]).length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No jobs found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}
