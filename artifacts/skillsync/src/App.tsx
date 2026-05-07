import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Assessments from "@/pages/assessments";
import AssessmentDetail from "@/pages/assessment-detail";
import Learning from "@/pages/learning";
import Resume from "@/pages/resume";
import Career from "@/pages/career";
import FreelanceMarketplace from "@/pages/freelance";
import FreelanceDetail from "@/pages/freelance-detail";
import CollegeForms from "@/pages/college-forms";
import CollegeSubmissions from "@/pages/college-submissions";
import CollegeAnnouncements from "@/pages/college-announcements";
import Leaderboard from "@/pages/leaderboard";
import Admin from "@/pages/admin";
import Profile from "@/pages/profile";
import Portfolio from "@/pages/portfolio";
import Applications from "@/pages/applications";
import InterviewInvitation from "@/pages/interview-invitation";
import Layout from "@/components/layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>;
  if (!user) return <Redirect to="/login" />;
  return <Layout><Component /></Layout>;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>;
  if (user) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login"><PublicRoute component={Login} /></Route>
      <Route path="/register"><PublicRoute component={Register} /></Route>
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/jobs"><ProtectedRoute component={Jobs} /></Route>
      <Route path="/jobs/:id"><ProtectedRoute component={JobDetail} /></Route>
      <Route path="/applications"><ProtectedRoute component={Applications} /></Route>
      <Route path="/interview-invitation"><ProtectedRoute component={InterviewInvitation} /></Route>
      <Route path="/assessments"><ProtectedRoute component={Assessments} /></Route>
      <Route path="/assessments/:id"><ProtectedRoute component={AssessmentDetail} /></Route>
      <Route path="/learning"><ProtectedRoute component={Learning} /></Route>
      <Route path="/resume"><ProtectedRoute component={Resume} /></Route>
      <Route path="/career"><ProtectedRoute component={Career} /></Route>
      <Route path="/freelance"><ProtectedRoute component={FreelanceMarketplace} /></Route>
      <Route path="/freelance/:id"><ProtectedRoute component={FreelanceDetail} /></Route>
      <Route path="/college/forms"><ProtectedRoute component={CollegeForms} /></Route>
      <Route path="/college/submissions"><ProtectedRoute component={CollegeSubmissions} /></Route>
      <Route path="/college/announcements"><ProtectedRoute component={CollegeAnnouncements} /></Route>
      <Route path="/leaderboard"><ProtectedRoute component={Leaderboard} /></Route>
      <Route path="/admin"><ProtectedRoute component={Admin} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route path="/portfolio/:id" component={Portfolio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
