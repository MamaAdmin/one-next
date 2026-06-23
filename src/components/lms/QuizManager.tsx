import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { useQuizzes, Quiz } from "@/hooks/useQuizzes";
import { QuizEditor } from "./QuizEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface QuizManagerProps {
  moduleId: string;
}

export const QuizManager = ({ moduleId }: QuizManagerProps) => {
  const { quizzes, loading, deleteQuiz, loadQuestionsForAdmin } = useQuizzes(moduleId);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  const handleEdit = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedQuiz(null);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    await deleteQuiz(quizToDelete);
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const confirmDelete = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    const loadAllQuestionCounts = async () => {
      const counts: Record<string, number> = {};
      for (const quiz of quizzes) {
        const questions = await loadQuestionsForAdmin(quiz.id);
        counts[quiz.id] = questions.length;
      }
      setQuestionCounts(counts);
    };
    if (quizzes.length > 0) {
      loadAllQuestionCounts();
    }
  }, [quizzes]);

  if (loading) {
    return <div className="text-center py-4">Lädt Quizzes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Quizzes
        </h3>
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Neues Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Noch keine Quizzes vorhanden
          </p>
          <Button onClick={handleCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Erstes Quiz erstellen
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{quiz.title}</h4>
                    {quiz.is_required && (
                      <Badge variant="secondary" className="text-xs">
                        Pflicht
                      </Badge>
                    )}
                    <Badge 
                      variant={(questionCounts[quiz.id] || 0) === 0 ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {questionCounts[quiz.id] || 0} {(questionCounts[quiz.id] || 0) === 1 ? "Frage" : "Fragen"}
                    </Badge>
                  </div>
                  {quiz.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {quiz.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Bestehen: {quiz.passing_score}%</span>
                    {quiz.time_limit_minutes && (
                      <span>Zeit: {quiz.time_limit_minutes} Min.</span>
                    )}
                    <span>Max. Versuche: {quiz.max_attempts}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(quiz)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(quiz.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <QuizEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedQuiz(null);
        }}
        quiz={selectedQuiz}
        moduleId={moduleId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quiz löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle Fragen und
              Versuche werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
