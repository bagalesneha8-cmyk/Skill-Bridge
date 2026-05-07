import { useRoute, useLocation } from "wouter";
import { useGetJob, useApplyJob, useGetJobMatches, useListApplications, getGetJobQueryKey, getGetJobMatchesQueryKey, getListApplicationsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Briefcase, Clock, Users, Zap, CheckCircle, XCircle, Timer } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = params?.id ?? "0";
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();

  const { data: job, isLoading } = useGetJob(id, {
    request: { headers },
  });

  const { data: matches } = useGetJobMatches({
    request: { headers },
  });

  const { data: applications } = useListApplications({}, {
    request: { headers },
  });

  const applyMutation = useApplyJob();

  useEffect(() => {
    if (Array.isArray(applications) && id) {
      const hasApplied = applications.some((app: any) => app.jobId === id || app.job?.id === id);
      if (hasApplied) setApplied(true);
    }
  }, [applications, id]);

  const match = Array.isArray(matches) ? matches.find((m: { job: { id: string } }) => m.job.id === id) : null;

  function handleApply() {
    applyMutation.mutate({ id, data: { coverLetter } }, {
      onSuccess: () => {
        setApplied(true);
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey({}) });
        toast({ title: "Applied successfully!", description: "Your application has been submitted." });
      },
      onError: (err: any) => {
        const msg = err.response?.data?.error || err.message || "Application failed";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    });
  }

  if (isLoading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40" />
      <Skeleton className="h-60" />
    </div>
  );

  const jobData = job as { id: string; title: string; company: string; type: string; description: string; skills: string[]; location?: string; salary?: string; deadline?: string; applicantCount: number } | undefined;
  if (!jobData) return <div className="p-6 text-muted-foreground">Job not found.</div>;

  const matchScore = match?.matchScore;
  const matchColor = matchScore && matchScore >= 70 ? "text-green-600" : matchScore && matchScore >= 40 ? "text-yellow-600" : "text-red-600";
  const barColor = matchScore && matchScore >= 70 ? "bg-green-500" : matchScore && matchScore >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/jobs">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl font-bold">{jobData.title}</h1>
                <p className="text-muted-foreground">{jobData.company}</p>
              </div>
              <Badge variant="outline" className="capitalize">{jobData.type}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {jobData.location && <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="w-4 h-4" />{jobData.location}</div>}
              {jobData.salary && <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Briefcase className="w-4 h-4" />{jobData.salary}</div>}
              {jobData.deadline && <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="w-4 h-4" />Deadline: {jobData.deadline}</div>}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="w-4 h-4" />{jobData.applicantCount} applicants</div>
            </div>

            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{jobData.description}</p>
          </div>

          <div className="p-6 border border-border rounded-lg bg-card">
            <h3 className="font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {jobData.skills.map((s: string) => {
                const matched = match?.matchedSkills?.includes(s.toLowerCase());
                const missing = match?.missingSkills?.includes(s.toLowerCase());
                return (
                  <div key={s} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border",
                    matched ? "border-green-500/30 bg-green-500/10 text-green-700" : missing ? "border-red-500/30 bg-red-500/10 text-red-700" : "border-border bg-secondary"
                  )} data-testid={`skill-${s}`}>
                    {matched ? <CheckCircle className="w-3 h-3" /> : missing ? <XCircle className="w-3 h-3" /> : null}
                    {s}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Match score */}
          {matchScore !== undefined && (
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">AI Match Score</span>
              </div>
              <div className="text-3xl font-bold font-mono mb-2 {matchColor}">{matchScore}%</div>
              <div className="bg-secondary rounded-full h-2 mb-3">
                <div className={cn("h-2 rounded-full", barColor)} style={{ width: `${matchScore}%` }} />
              </div>
              {match?.matchedSkills?.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="text-green-600 font-semibold">{match.matchedSkills.length}</span> matched, {" "}
                  <span className="text-red-600 font-semibold">{match?.missingSkills?.length ?? 0}</span> missing
                </div>
              )}
            </div>
          )}

          {/* Apply */}
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold mb-3">Apply Now</h3>
            {applied ? (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Applied!</p>
                <p className="text-xs text-muted-foreground">Your application is under review.</p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Cover letter (optional) — tell them why you're the perfect fit..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  rows={4}
                  className="mb-3 text-sm"
                  data-testid="input-cover-letter"
                />
                <Button
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                  className="w-full"
                  data-testid="button-apply"
                >
                  {applyMutation.isPending ? "Submitting..." : "Apply Now"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
