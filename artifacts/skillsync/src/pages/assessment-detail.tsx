import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useGetAssessment, useSubmitAssessment, getGetAssessmentQueryKey, getListAssessmentResultsQueryKey } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, CheckCircle, Trophy, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Question = { id: number; text: string; options: string[]; type: string };
type Answer = { questionId: number; answer: string };

export default function AssessmentDetail() {
  const [, params] = useRoute("/assessments/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [, setLocation] = useLocation();
  const headers = getAuthHeaders();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<{ score: number; passed: boolean; certificate?: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const { data: assessment, isLoading } = useGetAssessment(id, {
    request: { headers },
    query: { queryKey: getGetAssessmentQueryKey(id) },
  });

  const submitMutation = useSubmitAssessment();

  const assessData = assessment as { id: number; title: string; category: string; type: string; difficulty: string; duration: number; questionCount: number; questions: Question[] } | undefined;

  useEffect(() => {
    if (started && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started]);

  function startAssessment() {
    setStarted(true);
    setTimeLeft((assessData?.duration ?? 30) * 60);
    setCurrentQ(0);
    setAnswers([]);
  }

  function selectAnswer(questionId: number, answer: string) {
    setAnswers(prev => {
      const without = prev.filter(a => a.questionId !== questionId);
      return [...without, { questionId, answer }];
    });
  }

  function handleSubmit() {
    clearInterval(timerRef.current);
    submitMutation.mutate({ id, data: { answers } }, {
      onSuccess: (res: { score: number; passed: boolean; certificate?: string }) => {
        setResult(res);
        queryClient.invalidateQueries({ queryKey: getListAssessmentResultsQueryKey() });
      },
      onError: () => {
        toast({ title: "Submission failed", variant: "destructive" });
      },
    });
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeWarning = timeLeft < 120;

  if (isLoading) return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48" />
    </div>
  );

  if (!assessData) return <div className="p-6 text-muted-foreground">Assessment not found.</div>;

  // Result screen
  if (result) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4", result.passed ? "bg-green-500/10" : "bg-red-500/10")}>
            {result.passed ? <Trophy className="w-10 h-10 text-green-500" /> : <CheckCircle className="w-10 h-10 text-red-400" />}
          </div>
          <h1 className="text-3xl font-bold mb-1">{result.score}%</h1>
          <p className="text-lg font-semibold mb-2">{result.passed ? "Passed!" : "Not Passed"}</p>
          <p className="text-muted-foreground mb-6 text-sm">
            {result.passed ? `Congratulations! You passed ${assessData.title}.` : `You need 60% to pass. Review the material and try again.`}
          </p>
          {result.passed && result.certificate && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-6 text-sm">
              <div className="text-green-600 font-semibold mb-1">Certificate Earned</div>
              <code className="text-xs text-green-700">{result.certificate}</code>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/assessments">
              <Button variant="outline" data-testid="button-back-assessments">Back to Assessments</Button>
            </Link>
            <Link href="/career">
              <Button data-testid="button-view-career">View Career Stats</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Intro screen
  if (!started) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/assessments">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </Link>
        <div className="p-8 border border-border rounded-lg bg-card text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{assessData.title}</h1>
          <p className="text-muted-foreground mb-6">{assessData.category} • {assessData.type.toUpperCase()}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Questions", value: (assessData.questions as Question[])?.length ?? assessData.questionCount },
              { label: "Duration", value: `${assessData.duration} min` },
              { label: "Pass Score", value: "60%" },
            ].map(stat => (
              <div key={stat.label} className="p-3 bg-secondary rounded-lg">
                <div className="text-lg font-bold font-mono">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <Button onClick={startAssessment} size="lg" className="gap-2" data-testid="button-start-assessment">
            Start Assessment <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Quiz screen
  const questions = (assessData.questions as Question[]) ?? [];
  const currentQuestion = questions[currentQ];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)?.answer;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Timer & progress bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Question {currentQ + 1} of {questions.length}</span>
        </div>
        <div className={cn("flex items-center gap-1.5 font-mono text-sm font-bold", timeWarning ? "text-red-500" : "text-foreground")}>
          <Clock className="w-4 h-4" />
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-1.5 mb-6">
        <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="p-6 border border-border rounded-lg bg-card mb-4"
        >
          <h2 className="font-semibold mb-5 leading-relaxed" data-testid={`question-${currentQ}`}>{currentQuestion?.text}</h2>
          <div className="space-y-2">
            {currentQuestion?.options?.map((opt: string) => (
              <button
                key={opt}
                onClick={() => selectAnswer(currentQuestion.id, opt)}
                data-testid={`option-${opt.slice(0, 10).replace(/\s/g, "-")}`}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border text-sm transition-all",
                  currentAnswer === opt
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/40 hover:bg-secondary"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} className="gap-1" data-testid="button-prev">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        {currentQ < questions.length - 1 ? (
          <Button onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))} className="gap-1" data-testid="button-next">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitMutation.isPending} data-testid="button-submit-assessment">
            {submitMutation.isPending ? "Submitting..." : "Submit Assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}
