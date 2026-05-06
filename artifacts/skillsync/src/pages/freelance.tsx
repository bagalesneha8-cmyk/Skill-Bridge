import { useState } from "react";
import { useListFreelanceProjects, useCreateFreelanceProject, getListFreelanceProjectsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Code2, DollarSign, Clock, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3, "Title required"),
  description: z.string().min(20, "Description required (min 20 chars)"),
  budget: z.string().min(1, "Budget required"),
  skills: z.string(),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const statusColor: Record<string, string> = {
  open: "text-green-600 bg-green-500/10 border-green-500/30",
  in_progress: "text-blue-600 bg-blue-500/10 border-blue-500/30",
  completed: "text-muted-foreground bg-secondary",
  cancelled: "text-red-600 bg-red-500/10 border-red-500/30",
};

export default function FreelanceMarketplace() {
  const [open, setOpen] = useState(false);
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListFreelanceProjects({
    request: { headers },
    query: { queryKey: getListFreelanceProjectsQueryKey() },
  });

  const createMutation = useCreateFreelanceProject();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", budget: "", skills: "", deadline: "" },
  });

  function onSubmit(values: FormData) {
    createMutation.mutate({
      data: {
        ...values,
        skills: values.skills.split(",").map(s => s.trim()).filter(Boolean),
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFreelanceProjectsQueryKey() });
        setOpen(false);
        form.reset();
        toast({ title: "Project posted!", description: "Freelancers can now bid on your project." });
      },
    });
  }

  const projects = (data as { projects?: unknown[] })?.projects ?? [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Freelance Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-1">Browse projects and place competitive bids.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-post-project">
              <Plus className="w-4 h-4" /> Post Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Post a New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl><Input {...field} placeholder="e.g., E-Commerce Dashboard" data-testid="input-project-title" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} rows={4} placeholder="Describe the project requirements..." data-testid="input-project-description" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl><Input {...field} placeholder="$1,000 - $3,000" data-testid="input-project-budget" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (optional)</FormLabel>
                      <FormControl><Input {...field} type="date" data-testid="input-project-deadline" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="skills" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills (comma-separated)</FormLabel>
                    <FormControl><Input {...field} placeholder="React, TypeScript, Node.js" data-testid="input-project-skills" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-project">
                  {createMutation.isPending ? "Posting..." : "Post Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52" />)
        ) : (projects as Array<{ id: number; title: string; description: string; budget: string; skills: string[]; deadline?: string; status: string; bidCount: number }>).map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={`/freelance/${project.id}`}>
              <div className="p-5 border border-border rounded-lg bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer h-full" data-testid={`card-project-${project.id}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold leading-tight flex-1">{project.title}</h3>
                  <Badge variant="outline" className={cn("text-xs capitalize border flex-shrink-0", statusColor[project.status])}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{project.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{project.budget}</span>
                  {project.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.deadline}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.bidCount} bids</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {project.skills.slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {project.skills.length > 4 && <span className="text-xs text-muted-foreground">+{project.skills.length - 4}</span>}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
