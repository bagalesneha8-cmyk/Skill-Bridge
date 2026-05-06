import { useGetMe, useGetUserSkills, useGetUserEducation, useGetUserProjects, useGetUserCertifications, useGetUserExperience, useGetResume } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Github, Linkedin, Globe, Mail, Phone, MapPin, Building, ExternalLink, Briefcase, GraduationCap, Award, Code, CheckCircle2, ChevronRight, Share2, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Portfolio() {
  const { id } = useParams();
  const headers = getAuthHeaders();
  
  const { data: user, isLoading: loadingUser } = useGetMe({
    request: { headers },
  });

  const userId = id || (user as any)?.id;

  const { data: skills } = useGetUserSkills(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: education } = useGetUserEducation(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: projects } = useGetUserProjects(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: certs } = useGetUserCertifications(userId, { request: { headers }, query: { enabled: !!userId } });
  const { data: experience } = useGetUserExperience(userId, { request: { headers }, query: { enabled: !!userId } });

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Skeleton className="h-64 w-full max-w-4xl rounded-[3rem]" /></div>;
  }

  const userData = user as any;
  const { data: resumes } = useGetResume({ request: { headers }, query: { enabled: !!userId } });
  const activeResume = (resumes as any[])?.find(r => r.isMain) || (resumes as any[])?.[0];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#030303] selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
          <span className="font-black tracking-tighter text-xl">SKILLSYNC <span className="text-primary">PORTFOLIO</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full mr-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">ATS Score: {activeResume?.atsScore || 0}%</span>
          </div>
          <Button variant="outline" className="rounded-full font-bold text-xs uppercase tracking-widest h-10 px-6 border-black/10">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button className="rounded-full font-black text-xs uppercase tracking-widest h-10 px-6 bg-primary shadow-lg shadow-primary/20">
            <Download className="w-4 h-4 mr-2" /> Download Resume
          </Button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 max-w-6xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="flex flex-col md:flex-row gap-16 items-center md:items-start text-center md:text-left">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 rounded-[3rem] bg-black shadow-2xl overflow-hidden shrink-0 border-8 border-white"
            >
              {userData?.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white bg-gradient-to-br from-primary to-blue-600">
                  {userData?.name?.[0]}
                </div>
              )}
            </motion.div>
            
            <div className="space-y-6 flex-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full mb-2">
                  Available for Hire
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">{userData?.name}</h1>
                <p className="text-2xl font-bold text-black/40 mt-4">{userData?.role?.replace("_", " ")}</p>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl leading-relaxed text-black/60 max-w-2xl font-medium"
              >
                {userData?.bio || "A passionate professional dedicated to creating impactful solutions and pushing the boundaries of technology."}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-4"
              >
                <SocialIcon icon={Linkedin} href={userData?.socialLinks?.linkedin} />
                <SocialIcon icon={Github} href={userData?.socialLinks?.github} />
                <SocialIcon icon={Globe} href={userData?.socialLinks?.portfolio} />
                <div className="h-6 w-px bg-black/10 mx-2" />
                <div className="flex items-center gap-3 text-sm font-black text-black/30 uppercase tracking-widest">
                  <MapPin className="w-4 h-4" /> {userData?.location || "Remote"}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Experience & Education */}
        <section className="grid md:grid-cols-2 gap-20">
          <div className="space-y-12">
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-primary" /> Experience
            </h2>
            <div className="space-y-12 border-l-2 border-black/5 pl-8 ml-4">
              {(experience as any[])?.map((exp, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">{exp.startDate} — {exp.isCurrent ? "Present" : exp.endDate}</div>
                    <h3 className="text-2xl font-black tracking-tight">{exp.position}</h3>
                    <div className="text-lg font-bold text-black/40">{exp.company}</div>
                    <p className="text-sm text-black/60 font-medium leading-relaxed mt-4">{exp.responsibilities?.[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
              <GraduationCap className="w-8 h-8 text-primary" /> Education
            </h2>
            <div className="space-y-12 border-l-2 border-black/5 pl-8 ml-4">
              {(education as any[])?.map((edu, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-white border-4 border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary">{edu.startYear} — {edu.endYear || "Present"}</div>
                    <h3 className="text-2xl font-black tracking-tight">{edu.institution}</h3>
                    <div className="text-lg font-bold text-black/40">{edu.degree} in {edu.branch}</div>
                    {edu.cgpa && <div className="text-sm font-black text-primary mt-2">GPA: {edu.cgpa}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-5xl font-black tracking-tighter">Technical Arsenal</h2>
            <p className="text-black/40 font-bold uppercase tracking-widest text-xs">A comprehensive list of my professional expertise</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {(skills as any[])?.map((skill, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="px-8 py-4 bg-white border border-black/5 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex items-center gap-3 group"
              >
                <span className="font-black text-sm uppercase tracking-widest group-hover:text-primary transition-colors">{skill.skill}</span>
                <div className="w-1 h-1 rounded-full bg-black/10" />
                <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{skill.level}</span>
                {skill.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="space-y-16">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter">Selected Works</h2>
              <p className="text-black/40 font-bold uppercase tracking-widest text-xs">Building products that solve real problems</p>
            </div>
            <Button variant="ghost" className="rounded-full font-black text-xs uppercase tracking-widest gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {(projects as any[])?.map((project, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-white border border-black/5 rounded-[3.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-80 bg-black/[0.02] relative overflow-hidden">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/5">
                      <Code className="w-24 h-24" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 backdrop-blur-sm">
                    {project.githubLink && <a href={project.githubLink} target="_blank" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Github className="w-6 h-6 text-primary" /></a>}
                    {project.liveDemoLink && <a href={project.liveDemoLink} target="_blank" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform shadow-xl"><Globe className="w-6 h-6 text-primary" /></a>}
                  </div>
                </div>
                <div className="p-10 space-y-4">
                  <h3 className="text-3xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-black/50 font-medium leading-relaxed line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 pt-4">
                    {project.technologies?.map((tech: string, j: number) => (
                      <span key={j} className="text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-4 py-1.5 rounded-full">{tech}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer / Contact */}
        <footer className="pt-20 border-t border-black/5 text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-6xl font-black tracking-tighter">Let's build something <span className="text-primary underline decoration-8 underline-offset-8">extraordinary</span>.</h2>
            <p className="text-black/40 font-bold uppercase tracking-widest text-sm">Currently open to new opportunities and collaborations</p>
          </div>
          <div className="flex flex-wrap justify-center gap-12">
            <ContactInfo icon={Mail} label="Email" value={userData?.email} />
            <ContactInfo icon={Phone} label="Phone" value={userData?.phone} />
            <ContactInfo icon={Building} label="Institution" value={userData?.institution} />
          </div>
          <div className="pt-20 text-[10px] font-black uppercase tracking-widest text-black/20">
            &copy; {new Date().getFullYear()} {userData?.name}. Powered by SkillSync AI.
          </div>
        </footer>
      </main>
    </div>
  );
}

function SocialIcon({ icon: Icon, href }: { icon: any, href?: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" className="text-black/30 hover:text-primary transition-all hover:scale-125">
      <Icon className="w-6 h-6" />
    </a>
  );
}

function ContactInfo({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-black uppercase tracking-widest text-black/20">{label}</div>
      <div className="text-lg font-black tracking-tight flex items-center gap-2 justify-center">
        <Icon className="w-4 h-4 text-primary" /> {value}
      </div>
    </div>
  );
}
