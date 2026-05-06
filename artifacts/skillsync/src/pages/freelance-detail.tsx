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
import { ArrowLeft, DollarSign, Clock, Users, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

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
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-60" />
    </div>
  );

  if (!proj) return <div className="p-6 text-muted-foreground">Project not found.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/freelance">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" data-testid="button-back">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 border border-border rounded-lg bg-card">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold">{proj.title}</h1>
              <Badge variant="outline" className="capitalize">{proj.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{proj.budget}</span>
              {proj.deadline && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Deadline: {proj.deadline}</span>}
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{proj.bidCount} bids</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">{proj.description}</p>
            <div>
              <h3 className="font-semibold text-sm mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1">
                {proj.skills.map(s => (
                  <span key={s} className="text-xs bg-secondary px-2 py-1 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bids */}
          <div className="p-6 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-4">Bids ({Array.isArray(bids) ? bids.length : 0})</h2>
            {loadingBids ? <Skeleton className="h-32" /> : (
              Array.isArray(bids) && bids.length > 0 ? (
                <div className="space-y-3">
                  {(bids as Array<{ id: number; amount: string; proposal: string; deliveryTime?: string; status: string; freelancer?: { name: string } }>).map(bid => (
                    <div key={bid.id} className="p-3 bg-secondary rounded-lg" data-testid={`bid-${bid.id}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">{bid.freelancer?.name ?? "Freelancer"}</span>
                        <span className="font-mono font-semibold text-primary text-sm">{bid.amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{bid.proposal}</p>
                      {bid.deliveryTime && <p className="text-xs text-muted-foreground mt-1">Delivery: {bid.deliveryTime}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No bids yet. Be the first!</p>
              )
            )}
          </div>
        </div>

        {/* Place bid */}
        <div>
          <div className="p-5 border border-border rounded-lg bg-card">
            <h2 className="font-semibold mb-4">Place a Bid</h2>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Bid submitted!</p>
                <p className="text-xs text-muted-foreground mt-1">The client will review your proposal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Bid Amount</label>
                  <Input placeholder="e.g., $2,500" value={bidAmount} onChange={e => setBidAmount(e.target.value)} data-testid="input-bid-amount" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Delivery Time</label>
                  <Input placeholder="e.g., 2 weeks" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} data-testid="input-delivery-time" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Proposal</label>
                  <Textarea placeholder="Describe your approach and relevant experience..." rows={5} value={bidProposal} onChange={e => setBidProposal(e.target.value)} data-testid="input-bid-proposal" />
                </div>
                <Button onClick={handleBid} disabled={bidMutation.isPending} className="w-full" data-testid="button-submit-bid">
                  {bidMutation.isPending ? "Submitting..." : "Submit Bid"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
