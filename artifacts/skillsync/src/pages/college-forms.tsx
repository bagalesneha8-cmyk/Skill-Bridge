import { useState } from "react";
import { useListCollegeForms, useCreateCollegeForm, getListCollegeFormsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, Plus, ChevronRight, FileText, Briefcase, Calendar, BookOpen, ShieldCheck, Library, Home, Award, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { ApplyFormModal } from "@/components/apply-form-modal";

const formTypes = ["internship", "hackathon", "leave", "project", "assignment", "other"];

const typeColor: Record<string, string> = {
  internship: "text-blue-600 bg-blue-500/10 border-blue-500/30",
  hackathon: "text-purple-600 bg-purple-500/10 border-purple-500/30",
  leave: "text-orange-600 bg-orange-500/10 border-orange-500/30",
  project: "text-green-600 bg-green-500/10 border-green-500/30",
  assignment: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  other: "text-gray-600 bg-gray-500/10 border-gray-500/30",
};

const statusColor: Record<string, string> = {
  "Open": "text-blue-600 bg-blue-500/10 border-blue-500/30",
  "Closing Soon": "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  "Urgent": "text-red-600 bg-red-500/10 border-red-500/30",
};

const Zap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.71 13 3l-1.35 8.29H20L11 21l1.35-8.29H4Z"/></svg>
);

const Globe = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const dummyForms = [
  {
    id: "d1",
    title: "Internship NOC Request",
    description: "Official No Objection Certificate for off-campus summer internships and industrial training programs.",
    department: "Career Development Cell",
    deadline: "2026-06-15",
    status: "Open",
    type: "internship",
    icon: Briefcase
  },
  {
    id: "d2",
    title: "Leave Application",
    description: "Formal request for academic leave due to personal reasons or medical emergencies.",
    department: "Dean of Students",
    deadline: "2026-05-30",
    status: "Open",
    type: "leave",
    icon: Calendar
  },
  {
    id: "d3",
    title: "Bonafide Certificate Request",
    description: "Request for student verification certificate for passport, bank, or scholarship purposes.",
    department: "Academic Office",
    deadline: "2026-12-31",
    status: "Open",
    type: "other",
    icon: ShieldCheck
  },
  {
    id: "d4",
    title: "OD (On Duty) Permission",
    description: "Permission for attending hackathons, workshops, or inter-college competitions.",
    department: "Student Affairs",
    deadline: "2026-05-20",
    status: "Urgent",
    type: "hackathon",
    icon: Zap
  },
  {
    id: "d5",
    title: "Project Approval Form",
    description: "Initial proposal submission for final year capstone projects and research work.",
    department: "Department Research Committee",
    deadline: "2026-05-15",
    status: "Closing Soon",
    type: "project",
    icon: BookOpen
  },
  {
    id: "d6",
    title: "Industrial Visit Permission",
    description: "Consent form and department approval for organized industrial visits and field trips.",
    department: "Mechanical/Civil Dept",
    deadline: "2026-06-01",
    status: "Open",
    type: "other",
    icon: Globe
  },
  {
    id: "d7",
    title: "Scholarship Verification Form",
    description: "Verification of academic records and attendance for government and private scholarship applications.",
    department: "Financial Aid Office",
    deadline: "2026-05-25",
    status: "Urgent",
    type: "other",
    icon: Award
  },
  {
    id: "d8",
    title: "Exam Hall Ticket Request",
    description: "Request for issuance of hall tickets for upcoming semester examinations.",
    department: "Examination Cell",
    deadline: "2026-05-18",
    status: "Closing Soon",
    type: "assignment",
    icon: FileText
  },
  {
    id: "d9",
    title: "Semester Fee Extension",
    description: "Request for extension of deadline for payment of semester academic and hostel fees.",
    department: "Accounts Department",
    deadline: "2026-05-12",
    status: "Urgent",
    type: "other",
    icon: AlertTriangle
  },
  {
    id: "d10",
    title: "Library No-Due Clearance",
    description: "Final clearance from library for graduation or transfer certificate issuance.",
    department: "Central Library",
    deadline: "2026-07-30",
    status: "Open",
    type: "other",
    icon: Library
  },
  {
    id: "d11",
    title: "Hostel Leave Permission",
    description: "Permission to leave the hostel premises for extended duration or holidays.",
    department: "Hostel Warden Office",
    deadline: "2026-05-10",
    status: "Closing Soon",
    type: "leave",
    icon: Home
  },
  {
    id: "d12",
    title: "Final Year Review Submission",
    description: "Submission of documentation and status report for the second phase of project review.",
    department: "Project Coordinator",
    deadline: "2026-05-14",
    status: "Urgent",
    type: "project",
    icon: CheckCircle
  }
];

export default function CollegeForms() {
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("internship");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");

  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<{title: string, department: string, type: string} | null>(null);

  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: forms, isLoading } = useListCollegeForms(undefined, {
    request: { headers },
  });

  const createMutation = useCreateCollegeForm();

  function handleCreate() {
    if (!newTitle || !newDesc) {
      toast({ title: "Title and description required", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: { title: newTitle, type: newType as any, description: newDesc, deadline: newDeadline || undefined, fields: [] } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCollegeFormsQueryKey({}) });
        setOpen(false);
        setNewTitle(""); setNewDesc(""); setNewDeadline("");
        toast({ title: "Form created!" });
      },
    });
  }

  const canCreate = user?.role === "faculty" || user?.role === "admin";

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
                Administrative Portal
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                College <span className="text-primary">Forms</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                Submit internship NOCs, leave requests, and academic approvals.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/college/submissions">
                <Button variant="outline" className="h-14 px-8 rounded-full border-white/10 hover:bg-white/5 backdrop-blur-md font-bold text-white gap-3">
                  <FileText className="w-5 h-5" /> My Submissions
                </Button>
              </Link>
              {canCreate && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-14 px-8 rounded-full bg-primary hover:bg-white hover:text-primary shadow-xl shadow-primary/20 font-black gap-3 transition-all hover:scale-105 active:scale-95" data-testid="button-create-form">
                      <Plus className="w-5 h-5" /> Create Form
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] border-black/10 max-w-xl">
                    <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Generate Academic Form</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Form Identity</Label>
                        <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Internship NOC Request" data-testid="input-form-title" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Classification</Label>
                          <Select value={newType} onValueChange={setNewType}>
                            <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {formTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Deadline</Label>
                          <Input type="date" className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Requirements & Instructions</Label>
                        <Textarea className="rounded-xl border-black/5 bg-black/[0.02] font-bold min-h-[120px]" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the purpose and required documentation..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-12 px-8 rounded-full bg-primary font-black w-full" data-testid="button-submit-form">
                        {createMutation.isPending ? "Generating..." : "Generate Form"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)
          ) : (
            <>
              {(forms as any[])?.map((form, i) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/college/forms/${form.id}`}>
                    <div className="group p-8 rounded-[2.5rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <GraduationCap className="w-24 h-24 text-primary" />
                      </div>

                      <div>
                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors border border-primary/10">
                            <GraduationCap className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                          </div>
                          <Badge variant="outline" className={cn("rounded-full uppercase tracking-widest text-[10px] font-black px-3 py-1", typeColor[form.type as keyof typeof typeColor] || "border-black/10 group-hover:border-white/20 group-hover:text-white")}>
                            {form.type}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors tracking-tight">{form.title}</h3>
                        <p className="text-black/40 font-medium text-sm mb-6 group-hover:text-white/40 transition-colors line-clamp-2">{form.description}</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/30">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {form.deadline ? `Deadline: ${new Date(form.deadline).toLocaleDateString()}` : "No Deadline"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                          <span>Access Form</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {/* Dummy Demo Forms */}
              {dummyForms.map((form, i) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: ((forms as any[])?.length || 0 + i) * 0.05 }}
                >
                  <div className="group p-8 rounded-[2.5rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden h-full flex flex-col justify-between cursor-pointer">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <form.icon className="w-24 h-24 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors border border-primary/10">
                          <form.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={cn("rounded-full uppercase tracking-widest text-[10px] font-black px-3 py-1 border-black/10 group-hover:border-white/20 group-hover:text-white")}>
                            {form.type}
                          </Badge>
                          <Badge variant="outline" className={cn("rounded-full uppercase tracking-widest text-[8px] font-black px-2 py-0.5", statusColor[form.status])}>
                            {form.status}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-2 group-hover:text-white transition-colors tracking-tight">{form.title}</h3>
                      <p className="text-black/40 font-black uppercase tracking-widest text-[10px] mb-2 group-hover:text-primary transition-colors">{form.department}</p>
                      <p className="text-black/40 font-medium text-sm mb-6 group-hover:text-white/40 transition-colors line-clamp-2">{form.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-black/30 group-hover:text-white/30">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Deadline: {new Date(form.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedForm({
                            title: form.title,
                            department: form.department,
                            type: form.type
                          });
                          setApplyModalOpen(true);
                        }}
                        className="w-full h-12 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] group-hover:bg-primary group-hover:text-[#030303] group-hover:border-primary transition-all flex items-center justify-between px-6"
                      >
                        <span>Apply Now</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>

      <ApplyFormModal 
        isOpen={applyModalOpen} 
        onClose={() => setApplyModalOpen(false)} 
        form={selectedForm}
        student={{
          name: user?.name || "Student User",
          id: (user as any)?.studentId || "STU-2026-0042",
          year: "3rd",
          semester: "6th"
        }}
      />
    </div>
  );
}
