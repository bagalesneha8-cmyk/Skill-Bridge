import { useState, useRef } from "react";
import { useGetResume, useAnalyzeResume, getGetResumeQueryKey, useUploadResumeFile, useSyncResumeData } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, Zap, CheckCircle, CheckCircle2, XCircle, AlertCircle, Calendar, Plus, FileUp, Database, ArrowRight, Save, X, Sparkles, User, GraduationCap, Briefcase, Award, Code, Linkedin, Github, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function Resume() {
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [analysis, setAnalysis] = useState<{ atsScore: number; strengths: string[]; improvements: string[]; missingKeywords: string[]; extractedSkills: string[] } | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const { data: resumes, isLoading } = useGetResume({
    request: { headers },
  });

  const uploadMutation = useUploadResumeFile();
  const syncMutation = useSyncResumeData();
  const analyzeMutation = useAnalyzeResume();

  const resumeList = Array.isArray(resumes) ? resumes : [];
  const activeResume = resumeList.find(r => r.isMain) || resumeList[0];

  async function handleFileUpload(file: File) {
    if (!file) return;
    
    setIsUploading(true);
    uploadMutation.mutate({ data: { resume: file } }, {
      onSuccess: (result: any) => {
        setParsedData(result.parsedData);
        setSyncDialogOpen(true);
        queryClient.invalidateQueries({ queryKey: getGetResumeQueryKey() });
        toast({ title: "Resume uploaded successfully!", description: "AI has parsed your details. Review and sync to your profile." });
        setIsUploading(false);
      },
      onError: (error: any) => {
        console.error("Upload error:", error);
        const message = error?.data?.error || error?.message || "Please try again.";
        toast({ title: "Upload failed", description: message, variant: "destructive" });
        setIsUploading(false);
      }
    });
  }

  const handleSync = async () => {
    syncMutation.mutate({ data: parsedData }, {
      onSuccess: () => {
        toast({ 
          title: "Profile Updated Successfully!", 
          description: "Your professional profile has been synchronized with your resume data.",
          className: "bg-green-600 text-white border-none"
        });
        setSyncDialogOpen(false);
      },
      onError: (error: any) => {
        toast({ title: "Sync failed", description: error?.response?.data?.error || "Please try again.", variant: "destructive" });
      }
    });
  };

  function handleAnalyze() {
    if (!resumeText.trim() && !activeResume) {
      toast({ title: "Please upload your resume first", variant: "destructive" });
      return;
    }
    analyzeMutation.mutate({ data: { text: resumeText || activeResume?.summary || "", targetJobTitle: targetJob } }, {
      onSuccess: (res: any) => {
        setAnalysis(res);
      },
    });
  }

  const atsColor = (score: number) => score >= 75 ? "text-green-600" : score >= 50 ? "text-orange-600" : "text-red-600";
  const atsBarColor = (score: number) => score >= 75 ? "bg-green-500" : score >= 50 ? "bg-orange-500" : "bg-red-500";

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
                AI Career Optimization
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Resume <span className="text-primary">Intelligence</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4 max-w-xl">
                Upload your resume in PDF/DOCX format. Our AI will automatically parse your details and sync them with your professional profile.
              </p>
            </div>
            
            <div className="flex items-center gap-3 glass-dark p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <div className="px-6 py-2">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global ATS Rank</div>
                <div className="text-2xl font-black text-primary leading-none mt-1">{activeResume?.atsScore ? Math.round(activeResume.atsScore) : "N/A"}%</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Upload & History */}
          <div className="lg:col-span-1 space-y-10">
            {/* Upload Area */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-6"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-black/20">Resume Management</h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="group relative cursor-pointer border-2 border-dashed border-black/10 rounded-[2rem] p-10 transition-all hover:border-primary hover:bg-primary/[0.02] flex flex-col items-center justify-center text-center gap-4"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                
                <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  {isUploading ? <Sparkles className="w-8 h-8 text-primary animate-pulse" /> : <FileUp className="w-8 h-8 text-black/20 group-hover:text-primary transition-colors" />}
                </div>
                
                <div>
                  <div className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                    {isUploading ? "AI is Parsing..." : "Drop Resume Here"}
                  </div>
                  <p className="text-xs font-bold text-black/30 uppercase tracking-widest mt-1">PDF, DOCX, or DOC (Max 5MB)</p>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/30">
                  <span>Resume History</span>
                  <Badge variant="outline" className="text-[10px]">{resumeList.length} Versions</Badge>
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {resumeList.map((r, i) => (
                    <div 
                      key={r.id} 
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex items-center gap-4 group cursor-pointer",
                        r.isMain ? "bg-[#030303] text-white border-transparent shadow-xl" : "bg-white border-black/5 hover:border-primary/20"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", r.isMain ? "bg-primary/20" : "bg-black/5")}>
                        <FileText className={cn("w-5 h-5", r.isMain ? "text-primary" : "text-black/20")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black truncate">{r.filename}</div>
                        <div className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5", r.isMain ? "text-primary/60" : "text-black/30")}>
                          {new Date(r.updatedAt).toLocaleDateString()} • {r.atsScore}% ATS
                        </div>
                      </div>
                      {r.isMain && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                  ))}
                  
                  {resumeList.length === 0 && (
                    <div className="text-center py-10 opacity-20">
                      <Database className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No resumes found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Analysis & Insights */}
          <div className="lg:col-span-2 space-y-10">
            {/* ATS Analyzer Tool */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-black/20">AI Resume Analyzer</h2>
                    <div className="text-2xl font-black tracking-tighter mt-1">Optimize for Success</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-black/30 block ml-2">Target Role</label>
                  <Input 
                    placeholder="e.g. Senior Product Designer"
                    value={targetJob}
                    onChange={(e) => setTargetJob(e.target.value)}
                    className="h-14 rounded-2xl border-black/5 bg-black/[0.02] font-bold px-6 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={analyzeMutation.isPending}
                    className="w-full h-14 rounded-2xl bg-[#030303] hover:bg-primary text-white font-black text-sm uppercase tracking-widest transition-all shadow-xl gap-3"
                  >
                    {analyzeMutation.isPending ? "Analyzing..." : "Run AI Analysis"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {analysis ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10 pt-6 border-t border-black/5"
                  >
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="p-6 bg-white border border-black/5 rounded-3xl space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/30">ATS Match</div>
                        <div className={cn("text-4xl font-black tracking-tighter", atsColor(analysis.atsScore))}>{analysis.atsScore}%</div>
                        <Progress value={analysis.atsScore} className="h-2 bg-black/5" />
                      </div>
                      <div className="p-6 bg-white border border-black/5 rounded-3xl space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Keywords Found</div>
                        <div className="text-4xl font-black tracking-tighter text-primary">{analysis.extractedSkills.length}</div>
                        <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Industry terms detected</div>
                      </div>
                      <div className="p-6 bg-white border border-black/5 rounded-3xl space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Quality Rank</div>
                        <div className="text-4xl font-black tracking-tighter text-[#030303]">Elite</div>
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Top 5% of candidates</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Strengths
                        </h4>
                        <ul className="space-y-3">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm font-bold text-black/60 flex items-start gap-3 bg-green-50/50 p-3 rounded-xl border border-green-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Improvements
                        </h4>
                        <ul className="space-y-3">
                          {analysis.improvements.map((s, i) => (
                            <li key={i} className="text-sm font-bold text-black/60 flex items-start gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map(k => (
                          <Badge key={k} variant="outline" className="bg-red-50 text-red-600 border-red-200 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-20 text-center opacity-30">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <p className="text-sm font-black uppercase tracking-widest italic">Run analysis to see how your resume ranks for your target role.</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Smart Recommendations */}
            {activeResume && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-black/20">AI Smart Recommendations</h2>
                    <div className="text-2xl font-black tracking-tighter mt-1">Next Career Moves</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <RecommendationCard 
                    title="Suitable Jobs" 
                    items={["Senior Frontend Engineer at TechCorp", "React Architect at InnovateAI", "Product Engineer at StartupX"]}
                    icon={Briefcase}
                  />
                  <RecommendationCard 
                    title="Learning Resources" 
                    items={["Advanced TypeScript Patterns", "System Design for Scale", "Next.js 14 Deep Dive"]}
                    icon={GraduationCap}
                  />
                  <RecommendationCard 
                    title="Certifications" 
                    items={["AWS Certified Solutions Architect", "Google Cloud Professional", "Meta Frontend Specialization"]}
                    icon={Award}
                  />
                  <RecommendationCard 
                    title="Freelance Projects" 
                    items={["SaaS Dashboard Development", "AI Integration for CRM", "Performance Optimization Audit"]}
                    icon={Globe}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Confirmation Dialog */}
      <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border-black/10 p-0">
          <div className="bg-[#030303] text-white p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <DialogHeader className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full mb-4 border border-primary/20">
                AI Intelligence
              </div>
              <DialogTitle className="text-4xl font-black tracking-tighter">Review & Sync Profile</DialogTitle>
              <DialogDescription className="text-white/40 font-medium text-lg">
                Our AI has extracted the following information from your resume. Review it before we synchronize it with your profile.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Profile Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                  <User className="w-4 h-4" /> Personal Identity
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Full Name</label>
                    <Input value={parsedData?.profile?.name} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, name: e.target.value}})} className="rounded-xl font-bold bg-black/[0.02]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Email</label>
                      <Input value={parsedData?.profile?.email} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, email: e.target.value}})} className="rounded-xl font-bold bg-black/[0.02]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Phone</label>
                      <Input value={parsedData?.profile?.phone} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, phone: e.target.value}})} className="rounded-xl font-bold bg-black/[0.02]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/30">Bio / Summary</label>
                    <Textarea value={parsedData?.profile?.summary} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, summary: e.target.value}})} className="rounded-xl font-bold bg-black/[0.02] min-h-[100px]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary pt-4">
                  <Globe className="w-4 h-4" /> Social Connections
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0"><Linkedin className="w-4 h-4 text-black/30" /></div>
                    <Input value={parsedData?.profile?.socialLinks?.linkedin} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, socialLinks: {...parsedData.profile.socialLinks, linkedin: e.target.value}}})} className="rounded-xl font-bold bg-black/[0.02]" placeholder="LinkedIn URL" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0"><Github className="w-4 h-4 text-black/30" /></div>
                    <Input value={parsedData?.profile?.socialLinks?.github} onChange={e => setParsedData({...parsedData, profile: {...parsedData.profile, socialLinks: {...parsedData.profile.socialLinks, github: e.target.value}}})} className="rounded-xl font-bold bg-black/[0.02]" placeholder="GitHub URL" />
                  </div>
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                      <Code className="w-4 h-4" /> Detected Skills
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none text-[10px]">{parsedData?.skills?.length || 0} Found</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 p-6 bg-black/[0.02] rounded-3xl border border-black/5">
                    {parsedData?.skills?.map((skill: string, i: number) => (
                      <Badge key={i} className="bg-white text-[#030303] border-black/5 px-3 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group">
                        {skill}
                        <button onClick={() => setParsedData({...parsedData, skills: parsedData.skills.filter((_: any, idx: number) => idx !== i)})} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-8 rounded-full border border-dashed border-black/10 text-[10px] font-black uppercase tracking-widest gap-2">
                      <Plus className="w-3 h-3" /> Add More
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                    <Briefcase className="w-4 h-4" /> Work History
                  </div>
                  {parsedData?.experience?.length > 0 ? (
                    <div className="space-y-3">
                      {parsedData.experience.map((exp: any, i: number) => (
                        <div key={i} className="p-4 bg-white border border-black/5 rounded-2xl flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black">{exp.position}</div>
                            <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{exp.company}</div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setParsedData({...parsedData, experience: parsedData.experience.filter((_: any, idx: number) => idx !== i)})}><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-black/5 rounded-3xl text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest italic">No experience data extracted</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary">
                    <GraduationCap className="w-4 h-4" /> Academic Records
                  </div>
                  {parsedData?.education?.length > 0 ? (
                    <div className="space-y-3">
                      {parsedData.education.map((edu: any, i: number) => (
                        <div key={i} className="p-4 bg-white border border-black/5 rounded-2xl flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black">{edu.degree}</div>
                            <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{edu.institution}</div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setParsedData({...parsedData, education: parsedData.education.filter((_: any, idx: number) => idx !== i)})}><X className="w-4 h-4" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-black/5 rounded-3xl text-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-widest italic">No education data extracted</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 bg-black/[0.02] border-t border-black/5 gap-4">
            <Button variant="outline" onClick={() => setSyncDialogOpen(false)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">Discard</Button>
            <Button onClick={handleSync} className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3">
              <Save className="w-4 h-4" /> Approve & Sync Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecommendationCard({ title, items, icon: Icon }: any) {
  return (
    <div className="p-6 bg-white border border-black/5 rounded-3xl space-y-4 hover:border-primary/20 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h4 className="text-xs font-black uppercase tracking-widest text-black/40">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li key={i} className="text-sm font-bold text-black/70 flex items-center justify-between group/item">
            {item}
            <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
