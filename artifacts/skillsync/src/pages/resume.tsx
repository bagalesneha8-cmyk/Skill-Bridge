import { useState } from "react";
import { useGetResume, useUploadResume, useAnalyzeResume, getGetResumeQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Upload, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Resume() {
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [analysis, setAnalysis] = useState<{ atsScore: number; strengths: string[]; improvements: string[]; missingKeywords: string[]; extractedSkills: string[] } | null>(null);

  const { data: resume, isLoading } = useGetResume({
    request: { headers },
    query: { queryKey: getGetResumeQueryKey() },
  });

  const uploadMutation = useUploadResume();
  const analyzeMutation = useAnalyzeResume();

  const resumeData = resume as { filename?: string; summary?: string; extractedSkills?: string[]; atsScore?: number; experience?: Array<{ company: string; title: string; period: string; description: string }>; education?: Array<{ institution: string; degree: string; period: string; gpa?: string }> } | undefined;

  function handleUpload() {
    if (!resumeText.trim()) {
      toast({ title: "Please paste your resume text", variant: "destructive" });
      return;
    }

    const skills = extractSkills(resumeText);
    uploadMutation.mutate({ data: { filename: "resume.txt", summary: resumeText.slice(0, 300), skills } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey() });
        toast({ title: "Resume uploaded!", description: "Skills extracted and profile updated." });
      },
    });
  }

  function handleAnalyze() {
    if (!resumeText.trim() && !resumeData) {
      toast({ title: "Please upload your resume first", variant: "destructive" });
      return;
    }
    analyzeMutation.mutate({ data: { text: resumeText || resumeData?.summary || "", targetJobTitle: targetJob } }, {
      onSuccess: (res: typeof analysis) => {
        setAnalysis(res);
      },
    });
  }

  function extractSkills(text: string): string[] {
    const skillRegex = /\b(javascript|python|react|node\.?js|typescript|java|c\+\+|sql|postgresql|mongodb|aws|docker|kubernetes|machine learning|tensorflow|pytorch|html|css|git|agile|scrum)\b/gi;
    return [...new Set((text.match(skillRegex) || []).map(s => s.toLowerCase()))];
  }

  const atsColor = (score: number) => score >= 75 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const atsBarColor = (score: number) => score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload your resume, get an ATS score, and receive AI-powered improvement tips.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload section */}
        <div className="space-y-4">
          <div className="p-5 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Resume
            </h2>
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={10}
              className="mb-3 text-sm font-mono"
              data-testid="input-resume-text"
            />
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="flex-1 gap-1" data-testid="button-upload-resume">
                <Upload className="w-4 h-4" />
                {uploadMutation.isPending ? "Uploading..." : "Upload & Parse"}
              </Button>
            </div>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> AI Analysis
            </h2>
            <Input
              placeholder="Target job title (e.g., Full Stack Engineer)"
              value={targetJob}
              onChange={e => setTargetJob(e.target.value)}
              className="mb-3"
              data-testid="input-target-job"
            />
            <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} variant="outline" className="w-full gap-1" data-testid="button-analyze-resume">
              <Zap className="w-4 h-4 text-primary" />
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>
        </div>

        {/* Current resume & analysis */}
        <div className="space-y-4">
          {/* Current resume */}
          {isLoading ? (
            <Skeleton className="h-48" />
          ) : resumeData ? (
            <div className="p-5 border border-border rounded-lg bg-card" data-testid="card-current-resume">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Current Resume
              </h2>
              <div className="text-sm text-muted-foreground mb-3">{resumeData.filename}</div>

              {resumeData.atsScore !== null && resumeData.atsScore !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>ATS Score</span>
                    <span className={cn("font-bold font-mono", atsColor(resumeData.atsScore))}>{Math.round(resumeData.atsScore)}%</span>
                  </div>
                  <div className="bg-secondary rounded-full h-2">
                    <div className={cn("h-2 rounded-full", atsBarColor(resumeData.atsScore))} style={{ width: `${resumeData.atsScore}%` }} />
                  </div>
                </div>
              )}

              {(resumeData.extractedSkills ?? []).length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Extracted Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {(resumeData.extractedSkills ?? []).map(s => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-border rounded-lg bg-card text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground text-sm">No resume uploaded yet. Paste your resume text and click Upload.</p>
            </div>
          )}

          {/* Analysis result */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 border border-primary/30 rounded-lg bg-card" data-testid="card-analysis">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> AI Analysis Results
              </h2>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>ATS Score</span>
                  <span className={cn("font-bold font-mono", atsColor(analysis.atsScore))}>{analysis.atsScore}%</span>
                </div>
                <div className="bg-secondary rounded-full h-2">
                  <div className={cn("h-2 rounded-full", atsBarColor(analysis.atsScore))} style={{ width: `${analysis.atsScore}%` }} />
                </div>
              </div>

              <div className="space-y-3">
                {analysis.strengths.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Strengths
                    </div>
                    {analysis.strengths.map((s, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.improvements.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-orange-600 mb-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Improvements
                    </div>
                    {analysis.improvements.map((s, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 mb-1">
                        <AlertCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" /> {s}
                      </div>
                    ))}
                  </div>
                )}

                {analysis.missingKeywords.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-red-600 mb-1.5">Missing Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {analysis.missingKeywords.map(k => (
                        <span key={k} className="text-xs bg-red-500/10 text-red-600 border border-red-500/20 px-2 py-0.5 rounded">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
