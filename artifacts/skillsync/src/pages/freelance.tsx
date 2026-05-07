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

  const { data, isLoading } = useListFreelanceProjects(undefined, {
    request: { headers },
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
        status: "open",
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListFreelanceProjectsQueryKey({}) });
        setOpen(false);
        form.reset();
        toast({ title: "Project posted!", description: "Freelancers can now bid on your project." });
      },
    });
  }

  const projects = (data as { projects?: unknown[] })?.projects ?? [];

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
                Gig Economy
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Freelance <span className="text-primary">Marketplace</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                High-impact projects, verifiable payments, and direct client access.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 rounded-full bg-primary hover:bg-white hover:text-primary shadow-xl shadow-primary/20 font-black gap-3 transition-all hover:scale-105 active:scale-95" data-testid="button-post-project">
                    <Plus className="w-5 h-5" /> Post Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl rounded-[3rem] p-10 border-black/5">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black tracking-tight">Launch a <span className="text-primary">New Venture.</span></DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
                      <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black/30">Project Identity</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g., Enterprise SaaS Dashboard" className="h-14 rounded-2xl border-black/5 bg-black/[0.02] font-bold" data-testid="input-project-title" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black/30">Execution Details</FormLabel>
                          <FormControl><Textarea {...field} rows={5} placeholder="Define the mission, technical stack, and outcomes..." className="rounded-3xl border-black/5 bg-black/[0.02] font-medium leading-relaxed" data-testid="input-project-description" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-6">
                        <FormField control={form.control} name="budget" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black/30">Capital Allocation</FormLabel>
                            <FormControl><Input {...field} placeholder="$5k - $10k" className="h-14 rounded-2xl border-black/5 bg-black/[0.02] font-bold" data-testid="input-project-budget" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="deadline" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black/30">Target Launch</FormLabel>
                            <FormControl><Input {...field} type="date" className="h-14 rounded-2xl border-black/5 bg-black/[0.02] font-bold" data-testid="input-project-deadline" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name="skills" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-black/30">Expertise Stack (comma-separated)</FormLabel>
                          <FormControl><Input {...field} placeholder="Next.js, Tailwind, AWS, AI" className="h-14 rounded-2xl border-black/5 bg-black/[0.02] font-bold" data-testid="input-project-skills" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <Button type="submit" className="w-full h-16 rounded-[2rem] bg-[#030303] hover:bg-primary text-white font-black text-xl transition-all shadow-2xl" disabled={createMutation.isPending} data-testid="button-submit-project">
                        {createMutation.isPending ? "Transmitting..." : "Initiate Project"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Project grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-[2.5rem]" />)
          ) : projects.map((project: any, i: number) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Code2 className="w-7 h-7 text-primary group-hover:text-white" />
                  </div>
                  <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border", statusColor[project.status])}>
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-sm font-medium text-black/50 line-clamp-2 leading-relaxed">{project.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.skills?.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="bg-black/[0.03] text-black/40 border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                  {project.skills?.length > 3 && <span className="text-[10px] font-black text-black/20">+{project.skills.length - 3}</span>}
                </div>

                <div className="pt-6 border-t border-black/5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-black/20 uppercase tracking-widest">Budget</div>
                    <div className="text-sm font-black text-[#030303] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-primary" /> {project.budget}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-black/20 uppercase tracking-widest">Bids</div>
                    <div className="text-sm font-black text-[#030303] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-primary" /> {project.bidCount} Active
                    </div>
                  </div>
                </div>
              </div>

              <Link href={`/freelance/${project.id}`}>
                <Button className="w-full h-14 rounded-2xl bg-black text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[10px] mt-8 group-hover:shadow-lg group-hover:shadow-primary/20">
                  View & Bid
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {!isLoading && projects.length === 0 && (
          <div className="text-center py-32 glass-light rounded-[4rem] border-dashed border-2 border-black/5">
            <Code2 className="w-20 h-20 mx-auto mb-6 text-black/5" />
            <h3 className="text-2xl font-black mb-2">The marketplace is quiet</h3>
            <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Be the first to post a high-impact project.</p>
          </div>
        )}
      </div>
    </div>
  );
}
