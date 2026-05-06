import { useState } from "react";
import { useListCollegeForms, useCreateCollegeForm, getListCollegeFormsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, Plus, ChevronRight, FileText } from "lucide-react";
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

const formTypes = ["internship", "hackathon", "leave", "project", "assignment", "other"];

const typeColor: Record<string, string> = {
  internship: "text-blue-600 bg-blue-500/10 border-blue-500/30",
  hackathon: "text-purple-600 bg-purple-500/10 border-purple-500/30",
  leave: "text-orange-600 bg-orange-500/10 border-orange-500/30",
  project: "text-green-600 bg-green-500/10 border-green-500/30",
  assignment: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  other: "text-gray-600 bg-gray-500/10 border-gray-500/30",
};

export default function CollegeForms() {
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("internship");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
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
          ) : (forms as any[])?.map((form, i) => (
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
        </div>
      </div>
    </div>
  );
}
