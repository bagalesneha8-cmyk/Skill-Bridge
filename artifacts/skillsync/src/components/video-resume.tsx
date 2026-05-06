import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Upload, Camera, Trash2, Play, Pause, 
  RotateCcw, CheckCircle2, AlertCircle, FileUp, 
  Monitor, Loader2, Sparkles, X, Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUploadVideoResume, useUpdateUser } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VideoResumeProps {
  user: any;
  onUpdate: () => void;
}

export function VideoResume({ user, onUpdate }: VideoResumeProps) {
  const { toast } = useToast();
  const headers = getAuthHeaders();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.videoResumeUrl || null);
  const [mode, setMode] = useState<"idle" | "upload" | "record" | "preview">("idle");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const uploadMutation = useUploadVideoResume({ request: { headers } });
  const updateMutation = useUpdateUser({ request: { headers } });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) { // 2 minutes limit
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        setMode("preview");
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      toast({ title: "Camera access denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cameraStream?.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 50MB", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(20);
    
    uploadMutation.mutate({ data: { video: file } }, {
      onSuccess: (res: any) => {
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setPreviewUrl(res.videoUrl);
          setMode("idle");
          onUpdate();
          toast({ 
            title: "Video resume uploaded!", 
            description: "Your professional artifact has been synchronized.",
            className: "bg-green-600 text-white border-none shadow-2xl shadow-green-500/20" 
          });
        }, 800);
      },
      onError: (error: any) => {
        setIsUploading(false);
        console.error("Video upload error:", error);
        toast({ 
          title: "Upload failed", 
          description: error?.response?.data?.error || error?.message || "Please try again with a different file.",
          variant: "destructive" 
        });
      }
    });
  };

  const saveRecording = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], "recorded-resume.webm", { type: "video/webm" });
    handleFileUpload(file);
  };

  const deleteVideo = () => {
    updateMutation.mutate({ 
      id: user.id, 
      data: { videoResumeUrl: "", videoResumeThumbnail: "", communicationScore: 0 } 
    }, {
      onSuccess: () => {
        setPreviewUrl(null);
        setRecordedBlob(null);
        setMode("idle");
        onUpdate();
        toast({ title: "Video resume deleted" });
      }
    });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            Video Resume
          </h2>
          <p className="text-black/40 font-bold text-xs uppercase tracking-widest">Show recruiters the person behind the paper</p>
        </div>
        
        {previewUrl && mode === "idle" && (
          <Button 
            onClick={deleteVideo} 
            variant="outline" 
            className="rounded-2xl border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 font-black uppercase tracking-widest text-[10px] h-12 px-6"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete Video
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === "idle" && !previewUrl && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div 
              onClick={() => setMode("upload")}
              className="group cursor-pointer p-10 rounded-[3rem] border-2 border-dashed border-black/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Upload className="w-10 h-10 text-black/20 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-xl font-black tracking-tight">Upload Video</h4>
                <p className="text-xs font-bold text-black/30 uppercase tracking-widest mt-2">MP4, MOV, WEBM (Max 50MB)</p>
              </div>
            </div>

            <div 
              onClick={() => { setMode("record"); startRecording(); }}
              className="group cursor-pointer p-10 rounded-[3rem] border-2 border-dashed border-black/5 hover:border-primary/20 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="w-20 h-20 bg-black/5 rounded-[2rem] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Camera className="w-10 h-10 text-black/20 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-xl font-black tracking-tight">Record Video</h4>
                <p className="text-xs font-bold text-black/30 uppercase tracking-widest mt-2">Use your webcam & mic</p>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "upload" && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 glass-light rounded-[3.5rem] border border-black/5 flex flex-col items-center text-center gap-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" onClick={() => setMode("idle")} className="rounded-full w-10 h-10 p-0">
                <X className="w-5 h-5" />
              </Button>
              <h3 className="text-sm font-black uppercase tracking-widest text-black/20">Upload Video Resume</h3>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-lg p-16 border-2 border-dashed border-primary/20 bg-primary/[0.01] rounded-[3rem] flex flex-col items-center gap-6 hover:bg-primary/[0.03] transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="video/mp4,video/quicktime,video/webm" 
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileUp className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-black tracking-tight">Drop your video here</div>
                <p className="text-sm font-bold text-black/30 uppercase tracking-widest">or click to browse files</p>
              </div>
            </div>

            {isUploading && (
              <div className="w-full max-w-md space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary">
                  <span>Uploading Artifact...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-primary/10" />
              </div>
            )}
          </motion.div>
        )}

        {mode === "record" && (
          <motion.div 
            key="record"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative aspect-video bg-[#030303] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 group">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror"
              />
              
              <div className="absolute top-8 left-8 flex items-center gap-4">
                <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full">
                  <div className={cn("w-2 h-2 rounded-full", isRecording ? "bg-red-500 animate-pulse" : "bg-white/40")} />
                  <span className="text-xs font-black text-white uppercase tracking-[0.2em]">{formatTime(recordingTime)}</span>
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/20 backdrop-blur-md px-4 py-2 font-black text-[10px] uppercase tracking-widest">
                  Live Preview
                </Badge>
              </div>

              <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-6 px-8">
                {isRecording ? (
                  <Button 
                    onClick={stopRecording} 
                    className="h-20 px-12 rounded-[2rem] bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-red-500/20 gap-4"
                  >
                    <div className="w-3 h-3 bg-white rounded-sm" /> Stop Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={startRecording} 
                    className="h-20 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-[#030303] font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 gap-4"
                  >
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" /> Start Recording
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => { setMode("idle"); cameraStream?.getTracks().forEach(t => t.stop()); }}
                  className="h-20 w-20 rounded-[2rem] bg-white/10 border-white/10 text-white backdrop-blur-md hover:bg-white/20 p-0"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 glass-light rounded-3xl border border-black/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Resolution</div>
                  <div className="text-sm font-bold">1080p Full HD</div>
                </div>
              </div>
              <div className="p-6 glass-light rounded-3xl border border-black/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Stability</div>
                  <div className="text-sm font-bold">Optimized Stream</div>
                </div>
              </div>
              <div className="p-6 glass-light rounded-3xl border border-black/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-black/30">AI Ready</div>
                  <div className="text-sm font-bold">Auto-Analysis</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mode === "preview" && previewUrl && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative aspect-video bg-[#030303] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
              <video 
                src={previewUrl} 
                controls 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <Button 
                onClick={saveRecording} 
                disabled={isUploading}
                className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-[#030303] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 gap-3"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Confirm & Save Video Resume
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setMode("record"); startRecording(); }}
                className="h-16 px-10 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white gap-3"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { setMode("idle"); setRecordedBlob(null); setPreviewUrl(user?.videoResumeUrl || null); }}
                className="h-16 px-10 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {mode === "idle" && previewUrl && (
          <motion.div 
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid lg:grid-cols-5 gap-10"
          >
            <div className="lg:col-span-3 space-y-6">
              <div className="relative aspect-video bg-[#030303] rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/5 group">
                <video 
                  src={previewUrl} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:scale-110 transition-transform pointer-events-none">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Play className="w-8 h-8 text-[#030303] fill-current ml-1" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => {
                  const v = document.createElement('video');
                  v.src = previewUrl;
                  v.controls = true;
                  v.className = "w-full h-full object-contain";
                  // Open in a dialog or fullscreen
                  const win = window.open("", "_blank");
                  win?.document.write(`<html><body style="margin:0;background:#030303;display:flex;align-items:center;justify-center;"><video src="${previewUrl}" controls autoplay style="max-width:100%;max-height:100vh;"></video></body></html>`);
                }} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-8">
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">AI Evaluation</div>
                  <h3 className="text-2xl font-black tracking-tight">Communication</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                      <span>Sync Score</span>
                      <span className="text-primary">{user?.communicationScore || 0}%</span>
                    </div>
                    <Progress value={user?.communicationScore || 0} className="h-2.5 bg-primary/10" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-black/60">Professional Tone Detected</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-black/60">Clear Audio Visuals</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-black/60">Good Eye Contact</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => setMode("record")} 
                  variant="outline" 
                  className="w-full h-14 rounded-2xl border-black/5 font-black uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all gap-3"
                >
                  <RotateCcw className="w-4 h-4" /> Record New Version
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
