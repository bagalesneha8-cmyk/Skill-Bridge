import { useState } from "react";
import { useListSubmissions, useListCollegeForms, useCreateSubmission, useUpdateSubmission, getListSubmissionsQueryKey, getListCollegeFormsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  const { data: submissions, isLoading } = useListSubmissions({
    request: { headers },
    query: { queryKey: getListSubmissionsQueryKey() },
  });

  const { data: forms } = useListCollegeForms({
    request: { headers },
    query: { queryKey: getListCollegeFormsQueryKey() },
  });

  const createMutation = useCreateSubmission();
  const updateMutation = useUpdateSubmission();

  function handleSubmit() {
    if (!selectedFormId) {
      toast({ title: "Select a form", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: { formId: parseInt(selectedFormId, 10), data: {} } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubmissionsQueryKey() });
        setOpen(false);
        setSelectedFormId("");
        toast({ title: "Submitted!", description: "Your application is under review." });
      },
    });
  }

  function handleUpdateStatus(id: number, status: string) {
    updateMutation.mutate({ id, data: { status } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSubmissionsQueryKey() });
        toast({ title: `Submission ${status}` });
      },
    });
  }

  const isFaculty = user?.role === "faculty" || user?.role === "admin";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isFaculty ? "Review and approve student form submissions." : "Track your submitted college forms."}
          </p>
        </div>
        {!isFaculty && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-new-submission">
                <Plus className="w-4 h-4" /> New Submission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Submit a Form</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Select Form</label>
                  <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                    <SelectTrigger data-testid="select-form-id"><SelectValue placeholder="Choose a form..." /></SelectTrigger>
                    <SelectContent>
                      {(Array.isArray(forms) ? forms : []).map((f: { id: number; title: string; type: string }) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.title} ({f.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full" data-testid="button-submit-submission">
                  {createMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />) :
          (Array.isArray(submissions) ? submissions : []).map((sub: { id: number; status: string; feedback?: string; submittedAt: string; form?: { title: string; type: string }; user?: { name: string } }, i: number) => (
            <motion.div key={sub.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="p-4 border border-border rounded-lg bg-card" data-testid={`card-submission-${sub.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {statusIcon[sub.status as keyof typeof statusIcon]}
                    <div>
                      <div className="font-medium text-sm">{sub.form?.title ?? "Form"}</div>
                      {isFaculty && sub.user && <div className="text-xs text-muted-foreground">{sub.user.name}</div>}
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                      {sub.feedback && (
                        <div className="mt-1 text-xs text-muted-foreground italic">Feedback: {sub.feedback}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className={cn("text-xs capitalize border", statusColor[sub.status])}>
                      {sub.status}
                    </Badge>
                    {isFaculty && sub.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs text-green-600" onClick={() => handleUpdateStatus(sub.id, "approved")} data-testid={`button-approve-${sub.id}`}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" onClick={() => handleUpdateStatus(sub.id, "rejected")} data-testid={`button-reject-${sub.id}`}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        {!isLoading && (Array.isArray(submissions) ? submissions : []).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No submissions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
