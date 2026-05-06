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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">College Forms</h1>
          <p className="text-muted-foreground text-sm mt-1">Submit internship NOCs, leave requests, hackathon approvals, and more.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/college/submissions">
            <Button variant="outline" className="gap-2" data-testid="button-my-submissions">
              <FileText className="w-4 h-4" /> My Submissions
            </Button>
          </Link>
          {canCreate && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-form">
                  <Plus className="w-4 h-4" /> Create Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create New Form</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Form title" data-testid="input-form-title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger data-testid="select-form-type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {formTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} placeholder="Describe the form purpose..." data-testid="input-form-description" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Deadline (optional)</label>
                    <Input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} data-testid="input-form-deadline" />
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full" data-testid="button-submit-form">
                    {createMutation.isPending ? "Creating..." : "Create Form"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />) :
          (Array.isArray(forms) ? forms : []).map((form: { id: number; title: string; type: string; description: string; deadline?: string; status: string; submissionCount: number }, i: number) => (
            <motion.div key={form.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="p-5 border border-border rounded-lg bg-card hover:border-primary/40 transition-all h-full" data-testid={`card-form-${form.id}`}>
                <div className="flex items-start gap-2 mb-3">
                  <Badge variant="outline" className={cn("text-xs capitalize border flex-shrink-0", typeColor[form.type])}>
                    {form.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">{form.status}</Badge>
                </div>
                <h3 className="font-semibold mb-2 leading-tight">{form.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{form.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  {form.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Due: {form.deadline}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{form.submissionCount} submissions</span>
                </div>
                {form.status === "open" && (
                  <Link href={`/college/submissions`}>
                    <Button size="sm" variant="outline" className="w-full gap-1 text-xs" data-testid={`button-apply-form-${form.id}`}>
                      Submit Application <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
}
