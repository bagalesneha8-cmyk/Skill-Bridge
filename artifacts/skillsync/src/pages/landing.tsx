import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Zap, Briefcase, ClipboardList, BookOpen, Code2, GraduationCap, Trophy, ArrowRight, Users, TrendingUp, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";

function Counter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });
  const numericValue = parseInt(value.replace(/[,+%]/g, ""));
  const suffix = value.replace(/[0-9,]/g, "");

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, numericValue, {
        duration,
        onUpdate(value) {
          setCount(Math.floor(value));
        },
      });
      return () => controls.stop();
    }
  }, [numericValue, duration, isInView]);

  return (
    <span ref={nodeRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const features = [
  { icon: Briefcase, title: "AI Job Matching", desc: "Get matched with jobs and internships based on your skill profile with a precision score." },
  { icon: ClipboardList, title: "Skill Assessments", desc: "Prove your abilities with timed MCQ, coding, and aptitude tests that earn you certificates." },
  { icon: BookOpen, title: "Learning Roadmaps", desc: "Personalized learning paths curated from top platforms like Coursera, Udemy, and roadmap.sh." },
  { icon: Code2, title: "Freelance Marketplace", desc: "Browse client projects, place competitive bids, and grow your freelance portfolio." },
  { icon: GraduationCap, title: "College Management", desc: "Submit internship NOCs, leave forms, and access institutional announcements in one place." },
  { icon: Trophy, title: "Gamification & XP", desc: "Earn badges, climb the leaderboard, and track your career growth through levels and streaks." },
];

const stats = [
  { value: "12,000+", label: "Active Students" },
  { value: "3,400+", label: "Jobs Listed" },
  { value: "280+", label: "Assessments" },
  { value: "95%", label: "Placement Rate" },
];

function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* High-End Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)'
        }} 
      />
      
      {/* Moving Technical Lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: "-100%", y: `${20 + i * 15}%`, opacity: 0 }}
            animate={{ 
              x: "200%", 
              opacity: [0, 0.5, 0],
            }}
            transition={{ 
              duration: 8 + i * 2, 
              repeat: Infinity, 
              delay: i * 1.5,
              ease: "linear"
            }}
            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        ))}
      </div>

      {/* Floating Tech Nodes */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 rounded-full bg-primary/40 blur-[1px]"
          />
        ))}
      </div>

      {/* Glow Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] left-[20%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[100px]" />
    </div>
  );
}

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white overflow-hidden relative font-sans">
      {/* Universal Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between glass-dark rounded-2xl px-6 py-3 border-white/10 shadow-2xl">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-white">SkillSync<span className="text-primary">.ai</span></span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 rounded-full font-medium" data-testid="link-login">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 font-bold transition-all hover:scale-105 active:scale-95" data-testid="link-register">Join Platform</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-[#030303] text-white pt-48 pb-32 md:pt-64 md:pb-48 overflow-hidden">
        <BackgroundAnimation />
        
        {/* Subtle Tech Image Overlay */}
        <div className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none mix-blend-overlay" 
          style={{ 
            backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')`,
            backgroundRepeat: 'repeat'
          }} 
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            style={{ y: y1, opacity }}
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[10px] uppercase tracking-[0.2em] font-black px-5 py-2 rounded-full mb-10 border border-primary/20 backdrop-blur-md animate-float">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Next-Gen Career Intelligence
            </div>
            <h1 className="text-7xl md:text-[120px] font-black tracking-tight leading-[0.85] mb-12">
              <span className="block opacity-90">Design Your</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-300 to-primary bg-[length:200%_auto] animate-gradient">Destiny.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
              We've replaced guesswork with precision. SkillSync AI analyzes your DNA as a professional to map the shortest path to your peak career.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 rounded-full text-xl gap-3 shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-primary/50 transition-all font-black" data-testid="button-hero-register">
                  Get Started Now <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-xl border-white/10 hover:bg-white/5 backdrop-blur-md font-bold" data-testid="button-hero-login">
                  Live Preview
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Unique Stats Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32 relative">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="relative group p-10 glass-dark rounded-[2.5rem] border border-white/5 hover:border-primary/50 transition-all hover:-translate-y-2 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                <div className="text-5xl font-black text-white mb-3 tracking-tighter relative z-10">
                  <Counter value={stat.value} />
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.25em] relative z-10">{stat.label}</div>
                <div className="absolute top-4 right-6 opacity-10 group-hover:opacity-30 transition-opacity">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white/80 to-transparent z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-30" />
      </section>

      {/* Features Section */}
      <section className="relative bg-white text-[#030303] py-32 md:py-48 overflow-hidden">
        {/* Subtle Feature Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }} 
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Engineered for <span className="text-primary">Impact.</span></h2>
            <p className="text-[#030303]/40 text-xl font-medium">A suite of powerful tools designed to give you an unfair advantage in the global market.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="group p-10 rounded-[3rem] border border-black/5 bg-white hover:bg-[#030303] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                    <Icon className="w-32 h-32 text-primary" />
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{f.title}</h3>
                  <p className="text-[#030303]/50 text-lg leading-relaxed group-hover:text-white/50 transition-colors">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#030303] text-white py-32 md:py-48 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass-dark rounded-[4rem] p-16 md:p-32 overflow-hidden border-white/10"
          >
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none">Ready to <br/><span className="text-primary">Ascend?</span></h2>
              <p className="text-white/50 text-xl md:text-2xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed">Join the next generation of professionals who don't just find jobs—they build empires.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register">
                  <Button size="lg" className="h-20 px-12 rounded-full text-2xl gap-4 bg-primary hover:bg-white hover:text-primary transition-all shadow-[0_0_50px_rgba(59,130,246,0.4)] font-black">
                    Start Your Journey <ArrowRight className="w-8 h-8" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white py-20 px-6 border-t border-black/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter">SkillSync<span className="text-primary">.ai</span></span>
            </div>
            <p className="text-[#030303]/40 text-lg max-w-sm mb-8 font-medium">The intelligent operating system for your professional life. Powered by AI, driven by your potential.</p>
            <div className="flex gap-4">
              {/* Social icons could go here */}
              <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"><Github className="w-5 h-5"/></div>
              <div className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer"><Linkedin className="w-5 h-5"/></div>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#030303]/30">Platform</h4>
            <ul className="space-y-4 font-bold text-lg">
              <li><a href="#" className="hover:text-primary transition-colors">Career Matching</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Skill Assessments</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Freelance</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Learning</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-black text-sm uppercase tracking-widest text-[#030303]/30">Company</h4>
            <ul className="space-y-4 font-bold text-lg">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-black/30 font-bold">© 2026 SkillSync AI. All rights reserved.</p>
          <div className="flex gap-8 text-sm text-black/30 font-bold">
            <span>Built with ♥ by SkillSync Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
