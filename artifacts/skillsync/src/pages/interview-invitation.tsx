import { motion } from "framer-motion";
import { 
  Calendar, Clock, Video, Info, ExternalLink, 
  ArrowLeft, Briefcase, FileText, Camera, 
  Wifi, ShieldCheck, ChevronRight
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function InterviewInvitation() {
  const interviewData = {
    role: "Frontend Developer Intern",
    company: "Google",
    date: "May 10, 2026",
    time: "6:00 PM",
    type: "Virtual",
    platform: "Google Meet",
    link: "https://meet.google.com/xxx-xxxx",
    instructions: [
      "Join 10 mins early",
      "Keep camera ON",
      "Carry updated resume",
      "Stable internet required"
    ]
  };

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white relative pb-20">
      {/* Background elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 space-y-12 max-w-5xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-[#030303] text-white p-10 md:p-16 shadow-2xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <Link href="/applications">
              <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Applications
              </button>
            </Link>
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full mb-6 border border-primary/20">
              Interview Confirmation
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
              Ready for your <span className="text-primary">Interview?</span>
            </h1>
            <p className="text-white/40 text-lg font-medium mt-4">
              You've been invited to interview with the team at {interviewData.company}.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Main Card */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-10 glass-light rounded-[3.5rem] border border-black/5 shadow-2xl shadow-black/5"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-[#030303] rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-tight">
                    {interviewData.role}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-black/40 uppercase tracking-widest">{interviewData.company}</span>
                    <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-3">Hiring</Badge>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full">
                    <Video className="w-3.5 h-3.5 mr-2" />
                    {interviewData.type} Interview
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 py-10 border-y border-black/5">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Scheduled Date</div>
                    <div className="text-xl font-black tracking-tight">{interviewData.date}</div>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1">Meeting Time</div>
                    <div className="text-xl font-black tracking-tight">{interviewData.time}</div>
                    <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">(GMT +5:30) IST</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-8 bg-[#030303] rounded-[2.5rem] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Video className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Platform</div>
                      <div className="text-lg font-black tracking-tight">{interviewData.platform}</div>
                    </div>
                  </div>
                  <a href={interviewData.link} target="_blank" rel="noreferrer">
                    <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-[#030303] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center gap-2 group/btn">
                      Join Interview <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-8">
            {/* Instructions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
                  <Info className="w-5 h-5 text-black/40" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Interview Guidelines</h3>
              </div>

              <div className="space-y-4">
                {interviewData.instructions.map((instruction, index) => {
                  let Icon = ShieldCheck;
                  if (instruction.includes("camera")) Icon = Camera;
                  if (instruction.includes("internet")) Icon = Wifi;
                  if (instruction.includes("resume")) Icon = FileText;

                  return (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-black/[0.02] border border-black/5 group hover:border-primary/20 transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:text-primary transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-black/60 group-hover:text-black transition-colors">{instruction}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Resume Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black/30">Preparation Artifact</h3>
                <h4 className="text-2xl font-black tracking-tight">Your Resume</h4>
              </div>
              
              <div className="p-6 bg-[#030303] rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">Main_Resume.pdf</div>
                    <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Verified Artifact</div>
                  </div>
                </div>
                <Link href="/resume">
                  <Button variant="ghost" size="icon" className="rounded-full text-white/40 hover:text-primary hover:bg-primary/10">
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </Link>
              </div>

              <Link href="/resume">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all">
                  View Full Resume
                </Button>
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-4"
            >
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all">
                Reschedule
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
