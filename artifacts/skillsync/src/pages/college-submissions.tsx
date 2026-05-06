import { useState } from "react";
import { useListSubmissions, useListCollegeForms, useCreateSubmission, useUpdateSubmission, getListSubmissionsQueryKey, getListCollegeFormsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const statusIcon = {
  pending: <Clock className="w-4 h-4 text-yellow-500" />,
  approved: <CheckCircle className="w-4 h-4 text-green-500" />,
  rejected: <XCircle className="w-4 h-4 text-red-500" />,
};

const statusColor: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  approved: "text-green-600 bg-green-500/10 border-green-500/30",
  rejected: "text-red-600 bg-red-500/10 border-red-500/30",
};

export default function CollegeSubmissions() {
  const [open, setOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState("");
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: submissions, isLoading } = useListSubmissions(undefined, {
    request: { headers },
  });

  const { data: forms } = useListCollegeForms(undefined, {
    request: { headers },
  });

  const createMutation = useCreateSubmission();
  const updateMutation = useUpdateSubmission();

  function handleSubmit() {
    if (!selectedFormId) {
      toast({ title: "Select a form", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: { formId: selectedFormId, data: {} } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubmissionsQueryKey({}) });
        setOpen(false);
        setSelectedFormId("");
        toast({ title: "Submitted!", description: "Your application is under review." });
      },
    });
  }

  function handleUpdateStatus(id: string, status: string) {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubmissionsQueryKey({}) });
        toast({ title: `Submission ${status}` });
      },
    });
  }

  const isFaculty = user?.role === "faculty" || user?.role === "admin";

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
                Tracking & Approvals
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Academic <span className="text-primary">Submissions</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                {isFaculty ? "Review and approve student form submissions." : "Track your submitted college forms."}
              </p>
            </div>
            
            {!isFaculty && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 rounded-full bg-primary hover:bg-white hover:text-primary shadow-xl shadow-primary/20 font-black gap-3 transition-all hover:scale-105 active:scale-95" data-testid="button-new-submission">
                    <Plus className="w-5 h-5" /> New Submission
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-black/10">
                  <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Submit Academic Request</DialogTitle></DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Select Target Form</Label>
                      <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                        <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" data-testid="select-form-id"><SelectValue placeholder="Choose a form..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {(Array.isArray(forms) ? forms : []).map((f: { id: string; title: string; type: string }) => (
                            <SelectItem key={f.id} value={String(f.id)}>
                              {f.title} ({f.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending} className="h-12 px-8 rounded-full bg-primary font-black w-full" data-testid="button-submit-submission">
                      {createMutation.isPending ? "Transmitting..." : "Initiate Submission"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)
          ) : (submissions as any[])?.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 transition-all relative overflow-hidden"
            >
              <div className="flex items-start gap-8 relative z-10">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border", statusColor[sub.status as keyof typeof statusColor])}>
                  <div className="scale-125">{statusIcon[sub.status as keyof typeof statusIcon]}</div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Submission ID: {String(sub.id).slice(-8)}</div>
                      <h3 className="text-2xl font-black tracking-tight">{sub.form?.title || "Academic Request"}</h3>
                      {isFaculty && sub.user && <div className="text-xs font-bold text-black/60">{sub.user.name}</div>}
                    </div>
                    <Badge variant="outline" className={cn("rounded-full uppercase tracking-widest text-[10px] font-black px-4 py-1.5", statusColor[sub.status as keyof typeof statusColor])}>
                      {sub.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-widest text-black/30">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Submitted: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                    {sub.form?.type && <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Type: {sub.form.type}</span>}
                  </div>

                  {sub.feedback && (
                    <div className="p-4 rounded-xl bg-black/5 text-xs text-black/60 italic border border-black/5">
                      Feedback: {sub.feedback}
                    </div>
                  )}

                  {isFaculty && sub.status === "pending" && (
                    <div className="flex gap-4 pt-4">
                      <Button onClick={() => handleUpdateStatus(sub.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-xl h-10 px-6">Approve</Button>
                      <Button onClick={() => handleUpdateStatus(sub.id, "rejected")} variant="outline" className="border-red-500/20 text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest rounded-xl h-10 px-6">Reject</Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {!isLoading && (Array.isArray(submissions) ? submissions : []).length === 0 && (
            <div className="text-center py-24 glass-light rounded-[3rem] border border-black/5">
              <FileText className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-black/30">No submissions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
