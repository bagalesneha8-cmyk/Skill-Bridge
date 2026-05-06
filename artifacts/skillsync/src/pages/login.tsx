import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Zap, ArrowRight } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();

  function onSubmit(data: FormData) {
    loginMutation.mutate({ data }, {
      onSuccess: (result: { user: { id: number; name: string; email: string; role: string; avatar: string | null; bio: string | null; institution: string | null; location: string | null; xp: number; level: number; streak: number; createdAt: string; updatedAt: string }; token: string }) => {
        login(result.token, result.user as Parameters<typeof login>[1]);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Check your email and password.", variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sidebar-foreground">SkillSync AI</span>
        </div>
        <div>
          <blockquote className="text-sidebar-foreground/80 text-xl leading-relaxed mb-6">
            "SkillSync AI helped me land my internship at Google within 3 weeks. The AI job matching is eerily accurate."
          </blockquote>
          <div className="text-sidebar-foreground/60 text-sm">
            <div className="font-semibold text-sidebar-foreground">Alice Chen</div>
            <div>CS Senior, MIT — Shortlisted at Google, Stripe, and DeepMind</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[["12K+", "Users"], ["3.4K+", "Jobs"], ["95%", "Placement"]].map(([val, label]) => (
            <div key={label} className="bg-sidebar-accent rounded-lg p-3">
              <div className="text-xl font-bold text-sidebar-foreground font-mono">{val}</div>
              <div className="text-xs text-sidebar-foreground/50">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back to SkillSync AI</p>
          </div>

          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground mb-6 border border-border font-mono">
            Demo: alice@skillsync.ai / password
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full gap-2" disabled={loginMutation.isPending} data-testid="button-submit">
                {loginMutation.isPending ? "Signing in..." : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
