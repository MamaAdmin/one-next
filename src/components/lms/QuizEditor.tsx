import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuizzes, Quiz, QuizQuestion } from "@/hooks/useQuizzes";
import { QuestionEditor } from "./QuestionEditor";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface QuizEditorProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  moduleId: string;
}

export const QuizEditor = ({ isOpen, onClose, quiz, moduleId }: QuizEditorProps) => {
  const { createQuiz, updateQuiz, loadQuestionsForAdmin, deleteQuestion } = useQuizzes(moduleId);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    passing_score: 70,
    time_limit_minutes: null as number | null,
    max_attempts: 3,
    is_required: true,
    sort_order: 1,
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isQuestionEditorOpen, setIsQuestionEditorOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || "",
        passing_score: quiz.passing_score,
        time_limit_minutes: quiz.time_limit_minutes,
        max_attempts: quiz.max_attempts ?? 3,
        is_required: quiz.is_required ?? false,
        sort_order: quiz.sort_order,
      });
      setCurrentQuizId(quiz.id);
      loadQuizQuestions();
      setActiveTab("settings");
    } else {
      setFormData({
        title: "",
        description: "",
        passing_score: 70,
        time_limit_minutes: null,
        max_attempts: 3,
        is_required: true,
        sort_order: 1,
      });
      setQuestions([]);
      setCurrentQuizId(null);
      setActiveTab("settings");
    }
  }, [quiz]);

  const loadQuizQuestions = async () => {
    if (!quiz) return;
    const data = await loadQuestionsForAdmin(quiz.id);
    setQuestions(data);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (quiz) {
        await updateQuiz(quiz.id, formData);
        toast.success("Quiz aktualisiert");
      } else {
        const newQuiz = await createQuiz({ ...formData, module_id: moduleId });
        toast.success("Quiz erstellt! Fügen Sie jetzt Fragen hinzu.");
        setCurrentQuizId(newQuiz.id);
        setActiveTab("questions");
        setTimeout(() => {
          setIsQuestionEditorOpen(true);
        }, 100);
        return; // Don't close dialog, let user add questions
      }
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Fehler beim Speichern des Quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    await deleteQuestion(questionId);
    await loadQuizQuestions();
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setSelectedQuestion(question);
    setIsQuestionEditorOpen(true);
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "true_false": return "Wahr/Falsch";
      case "short_answer": return "Freitext";
      default: return type;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {quiz ? "Quiz bearbeiten" : "Neues Quiz erstellen"}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Einstellungen</TabsTrigger>
              <TabsTrigger value="questions" disabled={!currentQuizId}>
                Fragen ({questions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="z.B. Abschlusstest Modul 1"
                />
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optionale Beschreibung des Quiz"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="passing_score">Bestehen (%) *</Label>
                  <Input
                    id="passing_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passing_score: parseInt(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="max_attempts">Max. Versuche *</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    min="1"
                    value={formData.max_attempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_attempts: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time_limit">Zeitlimit (Minuten)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min="1"
                  value={formData.time_limit_minutes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_limit_minutes: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Kein Limit"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_required">Pflicht-Quiz</Label>
                <Switch
                  id="is_required"
                  checked={formData.is_required}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_required: checked })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 mt-4">
              {questions.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Dieses Quiz hat noch keine Fragen. Fügen Sie mindestens eine Frage hinzu, damit Teilnehmer das Quiz durchführen können.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {questions.length} {questions.length === 1 ? "Frage" : "Fragen"}
                </p>
                <Button
                  onClick={() => {
                    setSelectedQuestion(null);
                    setIsQuestionEditorOpen(true);
                  }}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Frage hinzufügen
                </Button>
              </div>

              {questions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Noch keine Fragen vorhanden
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedQuestion(null);
                      setIsQuestionEditorOpen(true);
                    }}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Erste Frage hinzufügen
                  </Button>
                </Card>
              ) : (
                <div className="space-y-2">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {getQuestionTypeLabel(question.question_type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {question.points} {question.points === 1 ? "Punkt" : "Punkte"}
                            </span>
                          </div>
                          <p className="text-sm">{question.question_text}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Speichert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {currentQuizId && (
        <QuestionEditor
          isOpen={isQuestionEditorOpen}
          onClose={() => {
            setIsQuestionEditorOpen(false);
            setSelectedQuestion(null);
            loadQuizQuestions();
          }}
          question={selectedQuestion}
          quizId={currentQuizId}
        />
      )}
    </>
  );
};
