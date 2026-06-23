import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertCircle, Play } from "lucide-react";
import { useQuizzes, Quiz } from "@/hooks/useQuizzes";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { QuizTaking } from "./QuizTaking";
import { QuizResults } from "./QuizResults";

interface QuizViewProps {
  moduleId: string;
  enrollmentId: string;
}

export const QuizView = ({ moduleId, enrollmentId }: QuizViewProps) => {
  const { quizzes, loading: quizzesLoading, loadQuestions } = useQuizzes(moduleId);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const { attempts, loading: attemptsLoading, getBestAttempt, canRetake } = useQuizAttempts(
    enrollmentId,
    selectedQuiz?.id
  );

  useEffect(() => {
    if (quizzes.length > 0 && !selectedQuiz) {
      setSelectedQuiz(quizzes[0]);
    }
  }, [quizzes, selectedQuiz]);

  useEffect(() => {
    const loadAllQuestionCounts = async () => {
      const counts: Record<string, number> = {};
      for (const quiz of quizzes) {
        const qs = await loadQuestions(quiz.id);
        counts[quiz.id] = qs.length;
      }
      setQuestionCounts(counts);
    };
    if (quizzes.length > 0) {
      loadAllQuestionCounts();
    }
  }, [quizzes]);

  const bestAttempt = getBestAttempt();
  
  useEffect(() => {
    if (showResults && bestAttempt && selectedQuiz) {
      loadQuestions(selectedQuiz.id).then(setQuestions);
    }
  }, [showResults, bestAttempt, selectedQuiz]);

  if (quizzesLoading || attemptsLoading) {
    return <div className="flex justify-center p-8">Lade Quizzes...</div>;
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Keine Quizzes für dieses Modul verfügbar.</p>
        </CardContent>
      </Card>
    );
  }

  if (showQuiz && selectedQuiz) {
    return (
      <QuizTaking
        quizId={selectedQuiz.id}
        enrollmentId={enrollmentId}
        onComplete={() => {
          setShowQuiz(false);
          setShowResults(true);
        }}
      />
    );
  }

  if (showResults && bestAttempt && selectedQuiz && questions.length > 0) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setShowResults(false)}>
          Zurück zur Übersicht
        </Button>
        <QuizResults
          attempt={bestAttempt}
          questions={questions}
          onRetake={canRetake(selectedQuiz.max_attempts ?? 0) ? () => {
            setShowResults(false);
            setShowQuiz(true);
          } : undefined}
          canRetake={canRetake(selectedQuiz.max_attempts ?? 0)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quizzes</CardTitle>
          <CardDescription>
            Testen Sie Ihr Wissen mit {quizzes.length} Quiz{quizzes.length !== 1 ? 'zes' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizzes.map((quiz) => {
            const quizAttempts = attempts.filter(a => a.quiz_id === quiz.id);
            const passed = quizAttempts.some(a => a.is_passed);
            const attemptCount = quizAttempts.length;
            const canTakeQuiz = canRetake(quiz.max_attempts ?? 0);
            const hasQuestions = (questionCounts[quiz.id] || 0) > 0;

            return (
              <Card key={quiz.id} className={passed ? "border-green-600" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      {quiz.description && (
                        <CardDescription>{quiz.description}</CardDescription>
                      )}
                    </div>
                    {passed && (
                      <Badge variant="default" className="bg-green-600">
                        <Trophy className="mr-1 h-3 w-3" />
                        Bestanden
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bestehensgrenze:</span>
                      <p className="font-medium">{quiz.passing_score}%</p>
                    </div>
                    {quiz.time_limit_minutes && (
                      <div>
                        <span className="text-muted-foreground">Zeitlimit:</span>
                        <p className="font-medium">{quiz.time_limit_minutes} Min</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Versuche:</span>
                      <p className="font-medium">
                        {attemptCount} / {quiz.max_attempts}
                      </p>
                    </div>
                    {bestAttempt && (
                      <div>
                        <span className="text-muted-foreground">Beste Punktzahl:</span>
                        <p className="font-medium">{bestAttempt.score}%</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!hasQuestions && (
                      <p className="text-sm text-muted-foreground">
                        Dieses Quiz hat noch keine Fragen.
                      </p>
                    )}
                    {canTakeQuiz && hasQuestions && (
                      <Button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowQuiz(true);
                        }}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {attemptCount === 0 ? "Quiz starten" : "Erneut versuchen"}
                      </Button>
                    )}
                    {bestAttempt && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setShowResults(true);
                        }}
                      >
                        Ergebnisse anzeigen
                      </Button>
                    )}
                    {!canTakeQuiz && (
                      <p className="text-sm text-muted-foreground">
                        Maximale Anzahl an Versuchen erreicht
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
