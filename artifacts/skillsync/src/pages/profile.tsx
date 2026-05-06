import { useState } from "react";
import {
  useGetMe,
  useUpdateUser,
  useGetUserSkills,
  useAddUserSkill,
  useUpdateUserSkill,
  useDeleteUserSkill,
  useGetUserEducation,
  useAddUserEducation,
  useUpdateEducation,
  useDeleteEducation,
  useGetUserProjects,
  useAddUserProject,
  useUpdateProject,
  useDeleteProject,
  useGetUserCertifications,
  useAddUserCertification,
  useUpdateCertification,
  useDeleteCertification,
  useGetUserExperience,
  useAddUserExperience,
  useUpdateExperience,
  useDeleteExperience,
  useGetUserAnalytics,
  useGetUserBadges,
  getGetMeQueryKey,
  getGetUserSkillsQueryKey,
  getGetUserEducationQueryKey,
  getGetUserProjectsQueryKey,
  getGetUserCertificationsQueryKey,
  getGetUserExperienceQueryKey,
  getGetUserAnalyticsQueryKey,
  getGetUserBadgesQueryKey,
} from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, MapPin, Building, Edit2, Save, Trophy, Award, Star, Flame,
  Github, Linkedin, Globe, Phone, Mail, Plus, Trash2, ExternalLink,
  Briefcase, GraduationCap, Code, FileText, BarChart3, Settings, Shield,
  Eye, EyeOff, CheckCircle2, MoreVertical, X, Calendar, Image as ImageIcon,
  ChevronRight, ArrowUpRight, Share2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";

export default function Profile() {
  const { user: authUser } = useAuth();
  const headers = getAuthHeaders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingInfo, setEditingInfo] = useState(false);

  const { data: me, isLoading: loadingMe } = useGetMe({
    request: { headers },
  });

  const userId = authUser?.id ?? "0";

  const { data: skills } = useGetUserSkills(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: education } = useGetUserEducation(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: projects } = useGetUserProjects(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: certs } = useGetUserCertifications(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: experience } = useGetUserExperience(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: analytics } = useGetUserAnalytics(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: gamification } = useGetUserBadges({ request: { headers } });

  const updateMutation = useUpdateUser();

  const user = me as any;
  const [editData, setEditData] = useState<any>({});

  function startEditInfo() {
    setEditData({
      name: user?.name ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
      institution: user?.institution ?? "",
      phone: user?.phone ?? "",
      socialLinks: user?.socialLinks ?? { linkedin: "", github: "", portfolio: "" },
      privacy: user?.privacy ?? { isPublic: true, showResume: true, showProjects: true, showContact: true },
    });
    setEditingInfo(true);
  }

  function saveEditInfo() {
    if (!userId) return;
    updateMutation.mutate({ id: userId as any, data: editData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setEditingInfo(false);
        toast({ title: "Profile updated!" });
      },
    });
  }

  if (loadingMe) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <Skeleton className="h-64 rounded-[3rem]" />
        <div className="grid lg:grid-cols-4 gap-8">
          <Skeleton className="h-96 rounded-[3rem]" />
          <Skeleton className="h-96 lg:col-span-3 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const levelProgress = Math.min(100, ((user?.xp ?? 0) % 500) / 5);

  return (
    <div className="min-h-screen bg-white selection:bg-primary selection:text-white relative">
      {/* Universal Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 space-y-10 max-w-7xl mx-auto">
        {/* Profile Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-[#030303] text-white p-10 md:p-16 shadow-2xl shadow-primary/10"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-end text-center md:text-left">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 border-4 border-white/10 shadow-2xl flex items-center justify-center text-5xl font-black text-primary relative group overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full border border-primary/20">
                  Professional Identity
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{user?.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/50 font-bold text-sm uppercase tracking-widest">
                  <span className="text-primary">{user?.role?.replace("_", " ")}</span>
                  {user?.institution && (
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4" /> {user.institution}
                    </span>
                  )}
                  {user?.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {user.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/profile/${userId}`);
                toast({ title: "Link copied!", description: "Share your professional profile with anyone." });
              }} variant="outline" className="h-14 px-8 rounded-full border-white/10 hover:bg-white/5 backdrop-blur-md font-bold text-white gap-3">
                <Share2 className="w-5 h-5" /> Share
              </Button>
              <Button onClick={startEditInfo} variant="outline" className="h-14 px-8 rounded-full border-white/10 hover:bg-white/5 backdrop-blur-md font-bold text-white gap-3">
                <Edit2 className="w-5 h-5" /> Edit Profile
              </Button>
              <Link href="/resume">
                <Button className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-black gap-3">
                  <FileText className="w-5 h-5" /> View Resume
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Gamification Stats */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black uppercase tracking-widest text-black/30">Platform Status</div>
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-black text-[#030303] tracking-tighter">Lv.{user?.level}</div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-2">Elite Rank</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/40">
                  <span>Progress</span>
                  <span>{user?.xp} XP</span>
                </div>
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  />
                </div>
                <div className="text-center text-[10px] font-black text-black/20 uppercase tracking-widest">
                  {500 - ((user?.xp ?? 0) % 500)} XP to Next Level
                </div>
              </div>

              <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#030303] leading-none">{user?.streak}</div>
                    <div className="text-[10px] font-black text-black/30 uppercase tracking-widest">Day Streak</div>
                  </div>
                </div>
                <Badge className="bg-black text-white font-black text-[10px] rounded-lg">RANK #42</Badge>
              </div>
            </motion.div>

            {/* Social & Contact */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-6"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-black/20">Connect</h3>
              <div className="space-y-4">
                <SocialLink icon={Github} label="GitHub" href={user?.socialLinks?.github} />
                <SocialLink icon={Linkedin} label="LinkedIn" href={user?.socialLinks?.linkedin} />
                <SocialLink icon={Globe} label="Portfolio" href={user?.socialLinks?.portfolio} />
                <div className="pt-4 border-t border-black/5 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-black/60">
                    <Phone className="w-4 h-4 text-black/20" /> {user?.phone || "Not provided"}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-black/60">
                    <Mail className="w-4 h-4 text-black/20" /> {user?.email}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privacy */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-6"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest text-black/20">Privacy</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black/40">Profile Visibility</span>
                  {user?.privacy?.isPublic ? 
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-black px-3 py-1 uppercase tracking-widest">Public</Badge> : 
                    <Badge className="bg-black/5 text-black/40 text-[10px] font-black px-3 py-1 uppercase tracking-widest">Private</Badge>
                  }
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-black/60">
                  <span>Show Projects</span>
                  {user?.privacy?.showProjects ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-black/20" />}
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-black/60">
                  <span>Contact Info</span>
                  {user?.privacy?.showContact ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-black/20" />}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start gap-8 bg-transparent h-auto p-0 mb-10 border-b border-black/5">
                {["about", "experience", "projects", "achievements", "analytics"].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-4 text-xs font-black uppercase tracking-[0.2em] text-black/30 data-[state=active]:text-primary transition-all"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="space-y-10 outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-6"
                >
                  <h2 className="text-sm font-black uppercase tracking-widest text-black/20">Professional Summary</h2>
                  <p className="text-xl font-medium leading-relaxed text-black/70 italic">
                    "{user?.bio || "Add a professional bio to showcase your personality and goals."}"
                  </p>
                </motion.div>

                {/* Skills Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-10"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-sm font-black uppercase tracking-widest text-black/20">Skills & Expertise</h2>
                    </div>
                    <AddSkillDialog userId={userId} headers={headers} />
                  </div>
                  
                  <div className="grid gap-10">
                    {["Programming Languages", "Web Development", "AI/ML", "UI/UX", "Cloud Computing", "Communication Skills", "Other"].map(cat => {
                      const catSkills = (skills as any[])?.filter(s => s.category === cat) || [];
                      if (catSkills.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-4">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">{cat}</h4>
                          <div className="flex flex-wrap gap-3">
                            {catSkills.map(skill => (
                              <SkillBadge key={skill.id} skill={skill} userId={userId} headers={headers} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-10 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tighter">Work Experience</h3>
                    <AddExperienceDialog userId={userId} headers={headers} />
                  </div>
                  <div className="space-y-6">
                    {(experience as any[])?.length > 0 ? (
                      (experience as any[]).map((exp, i) => (
                        <ExperienceCard key={exp.id} experience={exp} userId={userId} headers={headers} index={i} />
                      ))
                    ) : (
                      <EmptySection title="No experience added yet" icon={Briefcase} />
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between pt-10 border-t border-black/5">
                    <h3 className="text-2xl font-black tracking-tighter">Education</h3>
                    <AddEducationDialog userId={userId} headers={headers} />
                  </div>
                  <div className="space-y-6">
                    {(education as any[])?.length > 0 ? (
                      (education as any[]).map((edu, i) => (
                        <EducationCard key={edu.id} education={edu} userId={userId} headers={headers} index={i} />
                      ))
                    ) : (
                      <EmptySection title="No education records added yet" icon={GraduationCap} />
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-10 outline-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black tracking-tighter">Personal Projects</h3>
                  <AddProjectDialog userId={userId} headers={headers} />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {(projects as any[])?.length > 0 ? (
                    (projects as any[]).map((project, i) => (
                      <ProjectCard key={project.id} project={project} userId={userId} headers={headers} index={i} />
                    ))
                  ) : (
                    <div className="col-span-2">
                      <EmptySection title="No projects added yet" icon={Code} />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-10 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tighter">Certifications</h3>
                    <AddCertificationDialog userId={userId} headers={headers} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    {(certs as any[])?.length > 0 ? (
                      (certs as any[]).map((cert, i) => (
                        <CertificationCard key={cert.id} certification={cert} userId={userId} headers={headers} index={i} />
                      ))
                    ) : (
                      <div className="col-span-2">
                        <EmptySection title="No certifications added yet" icon={Award} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 border-t border-black/5 space-y-8">
                  <h3 className="text-2xl font-black tracking-tighter">Badges & Recognition</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(gamification as any)?.badges?.map((badge: any, i: number) => (
                      <motion.div 
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="group text-center p-8 glass-light rounded-[2rem] border border-black/5 hover:border-primary/30 transition-all"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Trophy className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-sm font-black tracking-tight">{badge.name}</h4>
                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mt-2">{badge.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-10 outline-none">
                <div className="grid md:grid-cols-3 gap-8">
                  <AnalyticsStat label="Profile Views" value={(analytics as any)?.views || 0} sub="Last 30 days" icon={Eye} />
                  <AnalyticsStat label="Project Impressions" value={(analytics as any)?.impressions || 0} sub="Last 30 days" icon={BarChart3} />
                  <AnalyticsStat label="Applications" value={(analytics as any)?.applicationStats?.applied || 0} sub={`${(analytics as any)?.applicationStats?.shortlisted || 0} Shortlisted`} icon={FileText} />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-10 glass-light rounded-[3rem] border border-black/5 space-y-10"
                >
                  <div className="space-y-1">
                    <h2 className="text-sm font-black uppercase tracking-widest text-black/20">Skill Percentiles</h2>
                    <p className="text-xs font-bold text-black/40 uppercase tracking-widest">How you rank against other candidates</p>
                  </div>
                  
                  <div className="space-y-8">
                    {(analytics as any)?.skillRankings?.length > 0 ? (
                      (analytics as any).skillRankings.map((sr: any) => (
                        <div key={sr.skill} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-lg font-black tracking-tight">{sr.skill}</span>
                            <span className="text-primary font-black text-sm">TOP {sr.percentile}%</span>
                          </div>
                          <div className="bg-black/5 h-2.5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${100 - sr.percentile}%` }}
                              className="bg-primary h-full shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <Zap className="w-12 h-12 text-black/5 mx-auto mb-4" />
                        <p className="text-sm font-bold text-black/30 uppercase tracking-widest italic">Take assessments to see your skill rankings.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editingInfo} onOpenChange={setEditingInfo}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] border-black/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Full Name</Label>
                <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Phone Number</Label>
                <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Bio</Label>
              <Textarea className="rounded-xl border-black/5 bg-black/[0.02] font-bold min-h-[100px]" value={editData.bio} onChange={e => setEditData({ ...editData, bio: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Institution</Label>
                <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={editData.institution} onChange={e => setEditData({ ...editData, institution: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Location</Label>
                <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={editData.location} onChange={e => setEditData({ ...editData, location: e.target.value })} />
              </div>
            </div>
            <div className="space-y-6 pt-6 border-t border-black/5">
              <Label className="text-xs font-black uppercase tracking-widest text-primary">Social Connections</Label>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                    <Linkedin className="w-5 h-5 text-black/40" />
                  </div>
                  <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" placeholder="LinkedIn URL" value={editData.socialLinks?.linkedin} onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, linkedin: e.target.value } })} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                    <Github className="w-5 h-5 text-black/40" />
                  </div>
                  <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" placeholder="GitHub URL" value={editData.socialLinks?.github} onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, github: e.target.value } })} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-black/40" />
                  </div>
                  <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" placeholder="Portfolio URL" value={editData.socialLinks?.portfolio} onChange={e => setEditData({ ...editData, socialLinks: { ...editData.socialLinks, portfolio: e.target.value } })} />
                </div>
              </div>
            </div>
            <div className="space-y-6 pt-6 border-t border-black/5">
              <Label className="text-xs font-black uppercase tracking-widest text-primary">Visibility & Controls</Label>
              <div className="grid grid-cols-2 gap-6">
                <VisibilityToggle id="isPublic" label="Public Profile" checked={editData.privacy?.isPublic} onChange={checked => setEditData({ ...editData, privacy: { ...editData.privacy, isPublic: checked } })} />
                <VisibilityToggle id="showResume" label="Show Resume" checked={editData.privacy?.showResume} onChange={checked => setEditData({ ...editData, privacy: { ...editData.privacy, showResume: checked } })} />
                <VisibilityToggle id="showProjects" label="Show Projects" checked={editData.privacy?.showProjects} onChange={checked => setEditData({ ...editData, privacy: { ...editData.privacy, showProjects: checked } })} />
                <VisibilityToggle id="showContact" label="Show Contact" checked={editData.privacy?.showContact} onChange={checked => setEditData({ ...editData, privacy: { ...editData.privacy, showContact: checked } })} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setEditingInfo(false)} className="h-12 px-8 rounded-full font-bold">Cancel</Button>
            <Button onClick={saveEditInfo} disabled={updateMutation.isPending} className="h-12 px-8 rounded-full bg-primary font-black">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Helper Components ---

function SocialLink({ icon: Icon, label, href }: { icon: any, label: string, href?: string }) {
  if (!href) return (
    <div className="flex items-center gap-4 text-xs font-bold text-black/20 uppercase tracking-widest">
      <Icon className="w-4 h-4" /> {label}
    </div>
  );
  return (
    <a href={href} target="_blank" className="flex items-center gap-4 text-xs font-black text-black/60 uppercase tracking-widest hover:text-primary transition-colors group">
      <Icon className="w-4 h-4 text-black/20 group-hover:text-primary transition-colors" /> 
      {label}
      <ArrowUpRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
    </a>
  );
}

function AnalyticsStat({ label, value, sub, icon: Icon }: any) {
  return (
    <div className="p-8 glass-light rounded-[2.5rem] border border-black/5 space-y-4">
      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <div className="text-[10px] font-black text-black/30 uppercase tracking-widest mt-1">{label}</div>
      </div>
      <div className="text-[10px] font-bold text-primary uppercase tracking-widest pt-3 border-t border-black/5">{sub}</div>
    </div>
  );
}

function VisibilityToggle({ id, label, checked, onChange }: any) {
  return (
    <div className="flex items-center space-x-3 bg-black/[0.02] p-4 rounded-xl border border-black/5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="w-5 h-5 rounded-md" />
      <Label htmlFor={id} className="text-xs font-bold text-black/60 cursor-pointer">{label}</Label>
    </div>
  );
}

function SkillBadge({ skill, userId, headers }: any) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteUserSkill();
  const { toast } = useToast();

  const handleDelete = () => {
    deleteMutation.mutate({ id: userId as any, skillId: skill.id as any }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserSkillsQueryKey(userId as any) });
        toast({ title: "Skill removed" });
      }
    });
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-black/5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20"
    >
      <span className="text-black/80">{skill.skill}</span>
      <span className="text-[10px] text-primary/60">{skill.level}</span>
      {skill.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
      <button onClick={handleDelete} className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

function ExperienceCard({ experience, userId, headers, index }: any) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteExperience();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate({ id: userId as any, expId: experience.id as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserExperienceQueryKey(userId as any) });
          toast({ title: "Experience deleted" });
        }
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-8 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 transition-all relative overflow-hidden"
    >
      <div className="flex items-start gap-8 relative z-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
          <Briefcase className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{experience.position}</h4>
            <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0 group-hover:opacity-100 rounded-full hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </div>
          <p className="text-sm font-black text-black/40 uppercase tracking-widest">{experience.company} <span className="text-primary/40">/ {experience.type}</span></p>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-black/30">
            <span className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {experience.startDate} — {experience.isCurrent ? "Present" : experience.endDate}
            </span>
            {experience.location && <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {experience.location}</span>}
          </div>
          {experience.responsibilities?.length > 0 && (
            <ul className="mt-6 space-y-3">
              {experience.responsibilities.map((r: string, i: number) => (
                <li key={i} className="text-sm font-medium text-black/60 flex items-start gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EducationCard({ education, userId, headers, index }: any) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteEducation();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate({ id: userId as any, eduId: education.id as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserEducationQueryKey(userId as any) });
          toast({ title: "Education record deleted" });
        }
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-8 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 transition-all relative"
    >
      <div className="flex items-start gap-8 relative z-10">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
          <GraduationCap className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{education.institution}</h4>
            <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0 group-hover:opacity-100 rounded-full hover:bg-destructive/10" onClick={handleDelete}>
              <Trash2 className="w-5 h-5 text-destructive" />
            </Button>
          </div>
          <p className="text-sm font-black text-black/40 uppercase tracking-widest">{education.degree} <span className="text-primary/40">in {education.branch}</span></p>
          <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-black/30">
            <span className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {education.startYear} — {education.endYear || "Present"}
            </span>
            {education.cgpa && <span className="flex items-center gap-2 text-primary font-black"><Star className="w-3 h-3 fill-primary" /> {education.cgpa} CGPA</span>}
          </div>
          {education.achievements?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {education.achievements.map((a: string, i: number) => (
                <Badge key={i} className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black uppercase tracking-widest px-3 py-1">{a}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, userId, headers, index }: any) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProject();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate({ id: userId as any, projectId: project.id as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserProjectsQueryKey(userId as any) });
          toast({ title: "Project deleted" });
        }
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group rounded-[3rem] border border-black/5 bg-white hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 overflow-hidden"
    >
      <div className="h-48 bg-black/[0.02] relative overflow-hidden">
        {project.images?.[0] ? (
          <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/5">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}
        <div className="absolute inset-0 bg-[#030303]/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-sm">
          {project.githubLink && <a href={project.githubLink} target="_blank" className="w-12 h-12 bg-white/10 rounded-2xl hover:bg-primary transition-all flex items-center justify-center"><Github className="w-5 h-5 text-white" /></a>}
          {project.liveDemoLink && <a href={project.liveDemoLink} target="_blank" className="w-12 h-12 bg-white/10 rounded-2xl hover:bg-primary transition-all flex items-center justify-center"><Globe className="w-5 h-5 text-white" /></a>}
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</h4>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
        <p className="text-sm font-medium text-black/50 line-clamp-2 h-10">{project.description}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          {project.technologies?.map((t: string) => (
            <span key={t} className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CertificationCard({ certification, userId, headers, index }: any) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteCertification();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate({ id: userId as any, certId: certification.id as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserCertificationsQueryKey(userId as any) });
          toast({ title: "Certification removed" });
        }
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group p-6 glass-light rounded-[2.5rem] border border-black/5 hover:border-primary/20 transition-all"
    >
      <div className="flex items-start gap-6">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
          <Award className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors">{certification.name}</h4>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 rounded-full hover:bg-destructive/10 shrink-0" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          <p className="text-xs font-black text-black/40 uppercase tracking-widest">{certification.organization}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest">Issued {certification.issueDate}</span>
            {certification.credentialUrl && (
              <a href={certification.credentialUrl} target="_blank" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
                Verify <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptySection({ title, icon: Icon }: any) {
  return (
    <div className="p-16 border-2 border-dashed border-black/5 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4 bg-black/[0.01]">
      <div className="w-16 h-16 rounded-[1.5rem] bg-black/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-black/10" />
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-black tracking-tight text-black/30">{title}</h4>
        <p className="text-xs font-bold text-black/20 uppercase tracking-widest">Add information to build your professional profile.</p>
      </div>
    </div>
  );
}

// --- Dialog Components (Simplified for structure) ---

function AddSkillDialog({ userId, headers }: any) {
  const [open, setOpen] = useState(false);
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("beginner");
  const [category, setCategory] = useState("Other");
  const queryClient = useQueryClient();
  const mutation = useAddUserSkill();
  const { toast } = useToast();

  const handleAdd = () => {
    if (!skill) return;
    mutation.mutate({ id: userId as any, data: { skill, level: level as any, category } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserSkillsQueryKey(userId as any) });
        setOpen(false);
        setSkill("");
        toast({ title: "Skill added!" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Add Expertise</DialogTitle></DialogHeader>
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Skill Name</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" placeholder="e.g. React, Python, UI Design" value={skill} onChange={e => setSkill(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {["Programming Languages", "Web Development", "AI/ML", "UI/UX", "Cloud Computing", "Communication Skills", "Other"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Proficiency</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd} disabled={mutation.isPending} className="h-12 px-8 rounded-full bg-primary font-black">Add Skill</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddExperienceDialog({ userId, headers }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({ type: "internship", position: "", company: "", startDate: "", isCurrent: false });
  const queryClient = useQueryClient();
  const mutation = useAddUserExperience();
  const { toast } = useToast();

  const handleAdd = () => {
    mutation.mutate({ id: userId as any, data: { ...data, responsibilities: [] } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserExperienceQueryKey(userId as any) });
        setOpen(false);
        toast({ title: "Experience added!" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Experience
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Add Experience</DialogTitle></DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Position</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.position} onChange={e => setData({ ...data, position: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Company</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.company} onChange={e => setData({ ...data, company: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Type</Label>
              <Select value={data.type} onValueChange={v => setData({ ...data, type: v })}>
                <SelectTrigger className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Start Date</Label>
              <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" type="month" value={data.startDate} onChange={e => setData({ ...data, startDate: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={handleAdd} className="h-12 px-8 rounded-full bg-primary font-black">Save Experience</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddEducationDialog({ userId, headers }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({ institution: "", degree: "", branch: "", startYear: 2022, endYear: 2026 });
  const queryClient = useQueryClient();
  const mutation = useAddUserEducation();
  const { toast } = useToast();

  const handleAdd = () => {
    mutation.mutate({ id: userId as any, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserEducationQueryKey(userId as any) });
        setOpen(false);
        toast({ title: "Education added!" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Education
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Add Education</DialogTitle></DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Institution</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.institution} onChange={e => setData({ ...data, institution: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Degree</Label>
              <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.degree} onChange={e => setData({ ...data, degree: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Branch</Label>
              <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.branch} onChange={e => setData({ ...data, branch: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Start Year</Label>
              <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" type="number" value={data.startYear} onChange={e => setData({ ...data, startYear: parseInt(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">End Year</Label>
              <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" type="number" value={data.endYear} onChange={e => setData({ ...data, endYear: parseInt(e.target.value) })} />
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={handleAdd} className="h-12 px-8 rounded-full bg-primary font-black">Save Education</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddProjectDialog({ userId, headers }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({ title: "", description: "", technologies: [] });
  const [techInput, setTechInput] = useState("");
  const queryClient = useQueryClient();
  const mutation = useAddUserProject();
  const { toast } = useToast();

  const handleAdd = () => {
    mutation.mutate({ id: userId as any, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserProjectsQueryKey(userId as any) });
        setOpen(false);
        toast({ title: "Project added!" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Add New Project</DialogTitle></DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Project Title</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Description</Label>
            <Textarea className="rounded-xl border-black/5 bg-black/[0.02] font-bold min-h-[100px]" value={data.description} onChange={e => setData({ ...data, description: e.target.value })} rows={4} />
          </div>
        </div>
        <DialogFooter><Button onClick={handleAdd} className="h-12 px-8 rounded-full bg-primary font-black">Save Project</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCertificationDialog({ userId, headers }: any) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<any>({ name: "", organization: "", issueDate: "" });
  const queryClient = useQueryClient();
  const mutation = useAddUserCertification();
  const { toast } = useToast();

  const handleAdd = () => {
    mutation.mutate({ id: userId as any, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserCertificationsQueryKey(userId as any) });
        setOpen(false);
        toast({ title: "Certification added!" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Certification
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black tracking-tight">Add Certification</DialogTitle></DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Certificate Name</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Organization</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" value={data.organization} onChange={e => setData({ ...data, organization: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-black/40">Issue Date</Label>
            <Input className="h-12 rounded-xl border-black/5 bg-black/[0.02] font-bold" type="month" value={data.issueDate} onChange={e => setData({ ...data, issueDate: e.target.value })} />
          </div>
        </div>
        <DialogFooter><Button onClick={handleAdd} className="h-12 px-8 rounded-full bg-primary font-black">Save Certificate</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
