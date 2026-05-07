import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Upload, Info, 
  User, Hash, Building, 
  CalendarDays, FileText, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApplyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    department: string;
    type: string;
  } | null;
  student: {
    name: string;
    id: string;
    year: string;
    semester: string;
  };
}

export function ApplyFormModal({ isOpen, onClose, form, student }: ApplyFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!form) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    toast({
      title: "Application Submitted!",
      description: `Your request for ${form.title} has been sent to the ${form.department}.`,
      className: "bg-green-600 text-white border-none shadow-2xl shadow-green-500/20"
    });
    onClose();
    setReason("");
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-transparent border-none overflow-hidden sm:rounded-[3rem]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full glass-dark border border-white/10 p-10 md:p-12 overflow-y-auto max-h-[90vh] no-scrollbar shadow-2xl"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <DialogHeader className="mb-10 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Academic Request</div>
                <DialogTitle className="text-3xl font-black tracking-tighter text-white">{form.title}</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Student Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <User className="w-3 h-3" /> Student Name
                </Label>
                <div className="h-14 rounded-2xl bg-white/5 border border-white/10 px-6 flex items-center font-bold text-white/80">
                  {student.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Student ID
                </Label>
                <div className="h-14 rounded-2xl bg-white/5 border border-white/10 px-6 flex items-center font-bold text-white/80">
                  {student.id}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Building className="w-3 h-3" /> Department
                </Label>
                <div className="h-14 rounded-2xl bg-white/5 border border-white/10 px-6 flex items-center font-bold text-white/80">
                  {form.department}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <CalendarDays className="w-3 h-3" /> Year / Semester
                </Label>
                <div className="h-14 rounded-2xl bg-white/5 border border-white/10 px-6 flex items-center font-bold text-white/80">
                  {student.year} Year / {student.semester} Sem
                </div>
              </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Reason / Description</Label>
              <Textarea 
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe the reason for your application..."
                className="min-h-[120px] rounded-3xl bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-white font-medium p-6 transition-all"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Supporting Documents (Optional)</Label>
              <div 
                className={cn(
                  "relative group cursor-pointer p-8 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3",
                  file ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-primary/30 hover:bg-white/[0.02]"
                )}
                onClick={() => document.getElementById('form-file-upload')?.click()}
              >
                <input 
                  type="file" 
                  id="form-file-upload" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  file ? "bg-primary text-[#030303]" : "bg-white/5 text-white/20 group-hover:text-primary"
                )}>
                  {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>
                <div className="text-center">
                  <div className="text-xs font-black text-white uppercase tracking-widest">
                    {file ? file.name : "Upload Document"}
                  </div>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                    PDF, JPG, PNG (Max 5MB)
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-[#030303] font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 gap-3"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#030303]/30 border-t-[#030303] rounded-full"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Application
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px]"
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Guidelines info */}
          <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <p className="text-[10px] font-bold text-white/30 leading-relaxed uppercase tracking-widest">
              Please ensure all details are correct. Once submitted, academic forms are processed by the respective department coordinators. You can track the status in the 'My Submissions' section.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
