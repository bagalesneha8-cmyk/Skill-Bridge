import { useRoute } from "wouter";
import { useGetFreelanceProject, useListBids, usePlaceBid, getGetFreelanceProjectQueryKey, getListBidsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, DollarSign, Clock, Users, CheckCircle, Code2, ShieldCheck, Briefcase } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FreelanceDetail() {
  const [, params] = useRoute("/freelance/:id");
  const id = params?.id ?? "0";
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [bidAmount, setBidAmount] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: project, isLoading } = useGetFreelanceProject(id, {
    request: { headers },
  });

  const { data: bids, isLoading: loadingBids } = useListBids(id, {
    request: { headers },
  });

  const bidMutation = usePlaceBid();

  function handleBid() {
    if (!bidAmount || !bidProposal) {
      toast({ title: "Amount and proposal required", variant: "destructive" });
      return;
    }
    bidMutation.mutate({ id, data: { amount: bidAmount, proposal: bidProposal, deliveryTime } }, {
      onSuccess: () => {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: getListBidsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetFreelanceProjectQueryKey(id) });
        toast({ title: "Bid placed!", description: "The client will review your proposal." });
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Failed to place bid";
        toast({ title: "Error", description: msg, variant: "destructive" });
      },
    });
  }

  const proj = project as { id: string; title: string; description: string; budget: string; skills: string[]; deadline?: string; status: string; bidCount: number } | undefined;

  if (isLoading) return (
    <div className="p-12 max-w-7xl mx-auto space-y-8">
      <Skeleton className="h-8 w-48 rounded-full" />
      <div className="grid lg:grid-cols-3 gap-12">
        <Skeleton className="lg:col-span-2 h-[600px] rounded-[3.5rem]" />
        <Skeleton className="h-[400px] rounded-[3.5rem]" />
      </div>
    </div>
  );

  if (!proj) return <div className="p-12 text-center font-black uppercase tracking-widest opacity-20">Project not found.</div>;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <Link href="/freelance">
        <button className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-black/40 hover:text-primary transition-all">
          <div className="w-8 h-8 rounded-full border border-black/5 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Marketplace
        </button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-12">
          {/* Main Project Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 glass-light rounded-[3.5rem] border border-black/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-primary/10" />
            
            <div className="relative z-10 space-y-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Code2 className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight leading-tight max-w-2xl">{proj.title}</h1>
                </div>
                <Badge className="px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] border border-green-500/20 bg-green-500/5 text-green-600">
                  {proj.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-primary">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-black/60">{proj.budget}</span>
                </div>
                {proj.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-primary">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-black/60">Due {proj.deadline}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-primary">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-black/60">{proj.bidCount} Active Bids</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Project Overview</h3>
                <p className="text-lg font-medium text-black/60 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
              </div>

              <div className="space-y-6 pt-6 border-t border-black/5">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Expertise Required</h3>
                <div className="flex flex-wrap gap-3">
                  {proj.skills.map(s => (
                    <Badge key={s} className="bg-black/[0.03] text-black/50 border-none font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-2xl">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bids Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-12 glass-light rounded-[3.5rem] border border-black/5 space-y-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black tracking-tight">Public Bids</h2>
              </div>
              <Badge className="bg-primary text-white font-black text-[10px] rounded-lg px-3 py-1">{Array.isArray(bids) ? bids.length : 0}</Badge>
            </div>

            {loadingBids ? <Skeleton className="h-32 rounded-3xl" /> : (
              Array.isArray(bids) && bids.length > 0 ? (
                <div className="grid gap-6">
                  {(bids as Array<{ id: number; amount: string; proposal: string; deliveryTime?: string; status: string; freelancer?: { name: string } }>).map(bid => (
                    <div key={bid.id} className="p-8 bg-black/[0.02] border border-black/5 rounded-[2.5rem] space-y-4 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
                            {bid.freelancer?.name?.[0] ?? "F"}
                          </div>
                          <span className="font-black text-sm tracking-tight">{bid.freelancer?.name ?? "Anonymous Freelancer"}</span>
                        </div>
                        <span className="text-sm font-black text-primary">{bid.amount}</span>
                      </div>
                      <p className="text-sm font-medium text-black/50 leading-relaxed">{bid.proposal}</p>
                      {bid.deliveryTime && (
                        <div className="pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black/20">
                          <Clock className="w-3 h-3" /> Delivery: {bid.deliveryTime}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-black/5 rounded-[2.5rem] space-y-4">
                  <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8 text-black/20" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest text-black/20">No bids yet. Be the first to apply!</p>
                </div>
              )
            )}
          </motion.div>
        </div>

        {/* Bidding Sidebar */}
        <div className="sticky top-12">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-10 glass-light rounded-[3.5rem] border border-black/5 space-y-8"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-black tracking-tight">Place a Bid</h2>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-black tracking-tight">Proposal Sent!</p>
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest leading-relaxed px-4">The client will review your bid and contact you soon.</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 ml-2">Your Quote</label>
                  <Input 
                    placeholder="e.g., $1,200" 
                    className="h-14 rounded-2xl bg-black/[0.03] border-none font-black text-sm px-6 focus:ring-2 ring-primary/20 transition-all"
                    value={bidAmount} 
                    onChange={e => setBidAmount(e.target.value)} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 ml-2">Delivery Time</label>
                  <Input 
                    placeholder="e.g., 2 weeks" 
                    className="h-14 rounded-2xl bg-black/[0.03] border-none font-black text-sm px-6 focus:ring-2 ring-primary/20 transition-all"
                    value={deliveryTime} 
                    onChange={e => setDeliveryTime(e.target.value)} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 ml-2">Proposal Brief</label>
                  <Textarea 
                    placeholder="Describe your approach..." 
                    className="min-h-[200px] rounded-3xl bg-black/[0.03] border-none font-medium text-sm p-6 focus:ring-2 ring-primary/20 transition-all resize-none"
                    value={bidProposal} 
                    onChange={e => setBidProposal(e.target.value)} 
                  />
                </div>
                <Button 
                  onClick={handleBid} 
                  disabled={bidMutation.isPending} 
                  className="w-full h-16 rounded-2xl bg-black text-white hover:bg-primary transition-all font-black uppercase tracking-widest text-[10px] shadow-xl shadow-black/5 hover:shadow-primary/20"
                >
                  {bidMutation.isPending ? "Transmitting..." : "Submit Proposal"}
                </Button>
                <p className="text-[9px] font-bold text-black/20 text-center uppercase tracking-widest px-4">
                  By bidding, you agree to our platform terms and freelancer service agreement.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
