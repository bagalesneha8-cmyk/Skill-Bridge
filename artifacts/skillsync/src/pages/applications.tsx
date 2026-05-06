import { useListApplications, useGetResume } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Clock, ChevronRight, ArrowLeft, 
  CheckCircle2, XCircle, Timer, Video, 
  Calendar, Info, ExternalLink, FileText,
  Monitor, Layout, Eye, Search, Download, X
} from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const statusConfig = {
  pending: {
    icon: Timer,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    label: "Application Pending"
  },
  interview: {
    icon: Clock,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    label: "Interview Scheduled"
  },
  accepted: {
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50 border-green-200",
    label: "Application Accepted"
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200",
    label: "Application Rejected"
  }
};

export default function Applications() {
  const headers = getAuthHeaders();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);

  const { data: applications, isLoading } = useListApplications({}, {
    request: { headers },
  });

  const { data: resumes } = useGetResume({
    request: { headers },
  });

  const mainResume = resumes?.find((r: any) => r.isMain);

  const selectedApp = Array.isArray(applications) ? applications.find((a: any) => a.id === selectedAppId) : null;

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white relative pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 space-y-12 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-[#030303] text-white p-10 md:p-16 shadow-2xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
            </Link>
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              Career Tracking
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              My <span className="text-primary">Applications</span>
            </h1>
            <p className="text-white/40 text-lg font-medium mt-4">
              Track the progress of your professional journey
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-black/20 ml-4">Active History</h2>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)
            ) : Array.isArray(applications) && applications.length > 0 ? (
              <div className="grid gap-6">
                {applications.map((app: any, i: number) => {
                  const status = (app.status as keyof typeof statusConfig) || "pending";
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  const isActive = selectedAppId === app.id;

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedAppId(app.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        "group p-8 rounded-[3rem] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-8",
                        isActive ? "bg-primary/[0.03] border-primary/30 shadow-xl shadow-primary/5" : "bg-white border-black/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-black/5"
                      )}>
                        <div className="flex items-center gap-8">
                          <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                            isActive ? "bg-primary text-white" : "bg-black/[0.02] text-black/20 group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            <Briefcase className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{app.job?.title || "Unknown Position"}</h3>
                            <p className="text-black/40 font-bold text-sm uppercase tracking-widest mt-1">{app.job?.company || "Unknown Company"}</p>
                            <div className="flex items-center gap-3 mt-4 text-[10px] font-black text-black/20 uppercase tracking-widest">
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <Badge className={cn("px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest border shadow-sm", config.color)}>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-3.5 h-3.5" />
                              {config.label}
                            </div>
                          </Badge>
                          <div className={cn(
                            "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
                            isActive ? "bg-primary border-primary text-white" : "border-black/5 text-black/20 group-hover:bg-primary group-hover:border-primary group-hover:text-white"
                          )}>
                            <ChevronRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 glass-light rounded-[3rem] border border-dashed border-black/10">
                <Briefcase className="w-16 h-16 text-black/5 mx-auto mb-6" />
                <h3 className="text-xl font-black text-black/20 uppercase tracking-widest">No applications found</h3>
                <Link href="/jobs">
                  <Button variant="link" className="text-primary font-bold mt-2">Explore opportunities</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-2 sticky top-12">
            <AnimatePresence mode="wait">
              {selectedApp ? (
                <motion.div
                  key={selectedApp.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-10 glass-light rounded-[3.5rem] border border-black/5 space-y-10"
                >
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Details & Actions</div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedApp.job?.title}</h2>
                    <p className="text-black/40 font-bold text-xs uppercase tracking-widest">{selectedApp.job?.company}</p>
                  </div>

                  {/* Interview Section */}
                  {selectedApp.status === "interview" && selectedApp.interview && (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] space-y-8"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                          <Video className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-blue-600/50">Next Step</div>
                          <div className="text-sm font-black text-blue-600">Video Interview</div>
                        </div>
                      </div>

                      <div className="grid gap-6">
                        <div className="flex items-start gap-4">
                          <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="text-xs font-black uppercase tracking-widest text-black/30 mb-1">Date & Time</div>
                            <div className="text-sm font-bold text-[#030303]">
                              {new Date(selectedApp.interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="text-xs font-medium text-black/50">
                              {new Date(selectedApp.interview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (IST)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <Info className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <div className="text-xs font-black uppercase tracking-widest text-black/30 mb-1">Instructions</div>
                            <p className="text-xs font-medium text-black/60 leading-relaxed italic">
                              "{selectedApp.interview.instructions}"
                            </p>
                          </div>
                        </div>
                      </div>

                      <a href={selectedApp.interview.link} target="_blank" rel="noreferrer" className="block">
                        <Button className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group">
                          Join Interview <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </a>
                    </motion.div>
                  )}

                  {/* Resume Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-black/30">Application Artifact</h3>
                      </div>
                    </div>
                    
                    {mainResume ? (
                      <div className="p-6 bg-black/[0.02] border border-black/5 rounded-3xl flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-black tracking-tight line-clamp-1">{mainResume.filename}</div>
                            <div className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Main Resume</div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => setResumePreviewOpen(true)}
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-black/5 rounded-3xl text-[10px] font-black text-black/20 uppercase tracking-widest">
                        No resume attached
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-6 border-t border-black/5 space-y-4">
                    <Link href={`/jobs/${selectedApp.job?.id}`}>
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all">
                        View Full Job Post
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-16 border-2 border-dashed border-black/5 rounded-[3.5rem] text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-black/[0.02] rounded-full flex items-center justify-center mx-auto">
                    <Layout className="w-10 h-10 text-black/10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-black/30">Selection Required</h3>
                    <p className="text-xs font-bold text-black/20 uppercase tracking-widest leading-relaxed">
                      Select an application from the left <br /> to view status details and next steps.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Dialog open={resumePreviewOpen} onOpenChange={setResumePreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <div className="h-full flex flex-col bg-white">
            <div className="p-8 border-b border-black/5 flex items-center justify-between bg-[#030303] text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black tracking-tight">{mainResume?.filename}</DialogTitle>
                  <DialogDescription className="text-white/40 text-xs font-bold uppercase tracking-widest mt-0.5">Professional Resume Artifact</DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest h-10 px-6">
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button variant="ghost" onClick={() => setResumePreviewOpen(false)} className="rounded-xl text-white/40 hover:text-white hover:bg-white/5 h-10 w-10 p-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 bg-[#f9f9f9]">
              <div className="max-w-3xl mx-auto bg-white shadow-xl shadow-black/[0.02] border border-black/5 rounded-[2rem] p-16 min-h-full">
                {/* Mock Resume Content - In a real app, this would be a PDF viewer or parsed HTML */}
                <div className="space-y-12">
                  <div className="space-y-4 border-b border-black/5 pb-12">
                    <h1 className="text-4xl font-black tracking-tighter uppercase">{mainResume?.userId?.name || "Professional Profile"}</h1>
                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-black/40">
                      <span>Detected from Resume Artifact</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                      <span>Verified System Sync</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-12">
                      <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-4">Professional Summary</h2>
                        <p className="text-base font-medium text-black/60 leading-relaxed italic">"{mainResume?.summary}"</p>
                      </section>

                      <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-4">Experience</h2>
                        <div className="space-y-8 pl-4">
                          {mainResume?.experience?.map((exp: any, i: number) => (
                            <div key={i} className="space-y-2">
                              <h3 className="text-lg font-black tracking-tight">{exp.position}</h3>
                              <div className="text-xs font-bold text-black/30 uppercase tracking-widest">{exp.company}</div>
                              <div className="text-[10px] font-black text-primary uppercase tracking-widest">{exp.duration}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-12">
                      <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-4">Core Skills</h2>
                        <div className="flex flex-wrap gap-2 pl-4">
                          {mainResume?.extractedSkills?.map((skill: string) => (
                            <Badge key={skill} className="bg-black/[0.03] text-black/50 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary border-l-2 border-primary pl-4">Education</h2>
                        <div className="space-y-6 pl-4">
                          {mainResume?.education?.map((edu: any, i: number) => (
                            <div key={i} className="space-y-1">
                              <div className="text-sm font-black tracking-tight">{edu.degree}</div>
                              <div className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{edu.institution}</div>
                              <div className="text-[10px] font-black text-primary uppercase tracking-widest">{edu.year}</div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
