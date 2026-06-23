import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuizAttempts } from "@/hooks/useQuizAttempts";
import { useQuizzes, QuizQuestion } from "@/hooks/useQuizzes";
import { toast } from "sonner";

interface QuizTakingProps {
  quizId: string;
  enrollmentId: string;
  onComplete: () => void;
}

export const QuizTaking = ({ quizId, enrollmentId, onComplete }: QuizTakingProps) => {
  const { startAttempt, saveAnswer, currentAttempt } = useQuizAttempts(enrollmentId, quizId);
  const { loadQuestions, quizzes } = useQuizzes();
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setQuiz] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const qs = await loadQuestions(quizId);
        setQuestions(qs);
        
        // Find the quiz details
        const quizData = quizzes.find(q => q.id === quizId);
        setQuiz(quizData);
        
        // Set time limit if exists
        if (quizData?.time_limit_minutes) {
          setTimeLeft(quizData.time_limit_minutes * 60);
        }
        
        if (!currentAttempt) {
          await startAttempt(quizId, enrollmentId);
        } else {
          setAnswers(currentAttempt.answers || {});
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [quizId, enrollmentId]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerChange = async (answer: string) => {
    if (!currentAttempt) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    await saveAnswer(currentAttempt.id, currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentAttempt) return;

    setIsSubmitting(true);
    try {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.rpc("grade_quiz_attempt", {
        p_attempt_id: currentAttempt.id,
        p_quiz_id: quizId,
        p_answers: answers,
        p_time_spent_seconds: timeSpentSeconds,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      toast.success(result?.is_passed ? "Quiz bestanden!" : "Quiz nicht bestanden");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Fehler beim Abschicken des Quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Lade Quiz...</div>;
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Dieses Quiz hat noch keine Fragen</p>
            <p className="text-sm text-muted-foreground">
              Der Administrator muss noch Fragen hinzufügen, bevor Sie das Quiz durchführen können.
            </p>
          </div>
          <Button variant="outline" onClick={onComplete}>
            Zurück zur Übersicht
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Quiz</h2>
          <p className="text-sm text-muted-foreground">
            Frage {currentQuestionIndex + 1} von {questions.length}
          </p>
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      <Progress value={progress} className="h-2" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {currentQuestion.question_text}
          </CardTitle>
          <CardDescription>
            {currentQuestion.points} {currentQuestion.points === 1 ? "Punkt" : "Punkte"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(currentQuestion.question_type === "multiple_choice" || currentQuestion.question_type === "true_false") && (
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={handleAnswerChange}
            >
              {(currentQuestion.options as string[])?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.question_type === "short_answer" && (
            <Textarea
              value={answers[currentQuestion.id] || ""}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Ihre Antwort..."
              rows={4}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Zurück
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Quiz abschicken
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Weiter
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
