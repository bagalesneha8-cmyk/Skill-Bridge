import { useState } from "react";
import { useListAnnouncements, useCreateAnnouncement, getListAnnouncementsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Plus } from "lucide-react";
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with the latest campus news and deadlines.</p>
        </div>
        {canCreate && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-new-announcement">
                <Plus className="w-4 h-4" /> Post Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Post Announcement</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" data-testid="input-announcement-title" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {announcementTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Content</label>
                  <Textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="Write your announcement..." data-testid="input-announcement-content" />
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full" data-testid="button-submit-announcement">
                  {createMutation.isPending ? "Posting..." : "Post Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />) :
          (Array.isArray(announcements) ? announcements : []).map((ann: { id: number; title: string; content: string; type: string; createdAt: string }, i: number) => (
            <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="p-5 border border-border rounded-lg bg-card" data-testid={`card-announcement-${ann.id}`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn("text-xs capitalize border", typeColor[ann.type])}>
                        {ann.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold">{ann.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed ml-12">{ann.content}</p>
              </div>
            </motion.div>
          ))}
        {!isLoading && (Array.isArray(announcements) ? announcements : []).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
