import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Award } from "lucide-react";
import { QuizAttempt } from "@/hooks/useQuizAttempts";
import { QuizQuestion } from "@/hooks/useQuizzes";

interface QuizResultsProps {
  attempt: QuizAttempt;
  questions: QuizQuestion[];
  onRetake?: () => void;
  canRetake: boolean;
}

export const QuizResults = ({ attempt, questions, onRetake, canRetake }: QuizResultsProps) => {
  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnswerStatus = (question: QuizQuestion, userAnswer: string) => {
    if (question.question_type === "short_answer") {
      return { isCorrect: null, icon: null };
    }
    
    // Fix: Compare with first element of correct_answer array
    const correctAnswer = Array.isArray(question.correct_answer) 
      ? question.correct_answer[0] 
      : question.correct_answer;
    const isCorrect = userAnswer === correctAnswer;
    return {
      isCorrect,
      icon: isCorrect ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <XCircle className="h-5 w-5 text-destructive" />
      )
    };
  };

  return (
    <div className="space-y-6">
      <Card className={attempt.is_passed ? "border-green-600" : "border-destructive"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {attempt.is_passed ? (
                  <>
                    <Award className="h-6 w-6 text-green-600" />
                    Bestanden!
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive" />
                    Nicht bestanden
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Versuch #{attempt.attempt_number}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {attempt.score}%
              </div>
              <div className="text-sm text-muted-foreground">
                Punktzahl
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Zeit: {formatTime(attempt.time_spent_seconds)}</span>
            </div>
            <div>
              Abgeschlossen: {new Date(attempt.completed_at!).toLocaleString('de-DE')}
            </div>
          </div>

          {!attempt.is_passed && canRetake && onRetake && (
            <Button onClick={onRetake} className="w-full">
              Quiz wiederholen
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Antworten im Detail</h3>
        {questions.map((question, idx) => {
          const userAnswer = attempt.answers?.[question.id];
          const { isCorrect, icon } = getAnswerStatus(question, userAnswer);

          return (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base">
                    {idx + 1}. {question.question_text}
                  </CardTitle>
                  {icon}
                </div>
                <CardDescription>
                  {question.points} {question.points === 1 ? "Punkt" : "Punkte"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Ihre Antwort:</span>
                  <div className="mt-1">
                    {userAnswer ? (
                      <Badge variant={isCorrect === true ? "default" : isCorrect === false ? "destructive" : "secondary"}>
                        {userAnswer}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Keine Antwort</span>
                    )}
                  </div>
                </div>

                {question.question_type !== "short_answer" && (
                  <div>
                    <span className="text-sm font-medium text-green-600">Richtige Antwort:</span>
                    <div className="mt-1">
                      <Badge variant="outline" className="border-green-600">
                        {Array.isArray(question.correct_answer) 
                          ? question.correct_answer[0] 
                          : question.correct_answer}
                      </Badge>
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium">Erklärung:</span>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
