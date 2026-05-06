import { Link } from "wouter";
import { Zap, Briefcase, ClipboardList, BookOpen, Code2, GraduationCap, Trophy, ArrowRight, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">SkillSync AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" data-testid="link-login">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button data-testid="link-register">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-mono px-3 py-1.5 rounded-full mb-6 border border-primary/20">
            <Zap className="w-3 h-3" />
            AI-Powered Career Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Your Career Command
            <br />
            <span className="text-primary">Center</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            SkillSync AI matches your skills with the right opportunities — jobs, internships, freelance projects, and learning paths — all in one intelligent platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-hero-register">
                Launch Your Career <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" data-testid="button-hero-login">Sign In</Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {stats.map(stat => (
            <div key={stat.label} className="p-4 border border-border rounded-lg bg-card">
              <div className="text-3xl font-bold text-primary font-mono">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to launch</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 border border-border rounded-lg bg-card hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get ahead?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of students and professionals building their careers with SkillSync AI.</p>
          <Link href="/register">
            <Button size="lg" className="gap-2" data-testid="button-cta-register">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">Test account: alice@skillsync.ai / password</p>
        </div>
      </section>
    </div>
  );
}
