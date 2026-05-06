import { useState } from "react";
import { useListAnnouncements, useCreateAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const typeColor: Record<string, string> = {
  general: "text-blue-600 bg-blue-500/10 border-blue-500/30",
  event: "text-purple-600 bg-purple-500/10 border-purple-500/30",
  deadline: "text-red-600 bg-red-500/10 border-red-500/30",
  hackathon: "text-green-600 bg-green-500/10 border-green-500/30",
  job: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
};

const announcementTypes = ["general", "event", "deadline", "hackathon", "job"];

export default function CollegeAnnouncements() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: announcements, isLoading } = useListAnnouncements({
    request: { headers },
  });

  const createMutation = useCreateAnnouncement();

  function handleCreate() {
    if (!title || !content) {
      toast({ title: "Title and content required", variant: "destructive" });
      return;
    }
    createMutation.mutate({ data: { title, content, type: type as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAnnouncementsQueryKey() });
        setOpen(false);
        setTitle(""); setContent(""); setType("general");
        toast({ title: "Announcement posted!" });
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

      <div className="relative z-10 p-8 space-y-12 max-w-5xl mx-auto">
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
                Institutional Intel
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">
                Campus <span className="text-primary">Broadcasting</span>
              </h1>
              <p className="text-white/40 text-lg font-medium mt-4">
                Stay updated with the latest campus news, deadlines, and hackathons.
              </p>
            </div>
            
            {canCreate && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 rounded-full bg-primary hover:bg-white hover:text-primary shadow-xl shadow-primary/20 font-black gap-3 transition-all hover:scale-105 active:scale-95" data-testid="button-new-announcement">
                    <Plus className="w-5 h-5" /> Post Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] border-black/10">
                  <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Post Announcement</DialogTitle></DialogHeader>
                  <div className="space-y-6 py-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Title</Label>
                      <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" data-testid="input-announcement-title" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Category</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {announcementTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Content</Label>
                      <Textarea className="rounded-xl border-black/5 bg-black/[0.02] font-bold min-h-[120px]" value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Write your announcement..." data-testid="input-announcement-content" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-12 px-8 rounded-full bg-primary font-black w-full" data-testid="button-submit-announcement">
                      {createMutation.isPending ? "Broadcasting..." : "Broadcast Now"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        <div className="grid gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)
          ) : (announcements as any[])?.map((ann, i) => (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 transition-all relative overflow-hidden"
              data-testid={`announcement-${ann.id}`}
            >
              <div className="flex items-start gap-6 relative z-10">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border", typeColor[ann.type as keyof typeof typeColor])}>
                  <Bell className="w-7 h-7" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={cn("rounded-full uppercase tracking-widest text-[10px] font-black px-3 py-1", typeColor[ann.type as keyof typeof typeColor])}>
                      {ann.type}
                    </Badge>
                    <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{ann.title}</h3>
                  <p className="text-black/60 font-medium leading-relaxed">{ann.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
