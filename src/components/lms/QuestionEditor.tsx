import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuizzes, QuizQuestion } from "@/hooks/useQuizzes";
import { Plus, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuizQuestion | null;
  quizId: string;
}

export const QuestionEditor = ({
  isOpen,
  onClose,
  question,
  quizId,
}: QuestionEditorProps) => {
  const { createQuestion, updateQuestion } = useQuizzes();
  const [formData, setFormData] = useState<{
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string[];
    points: number;
    explanation: string;
    sort_order: number;
  }>({
    question_text: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: [],
    points: 1,
    explanation: "",
    sort_order: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options || ["", "", "", ""],
        correct_answer: question.correct_answer,
        points: question.points,
        explanation: question.explanation || "",
        sort_order: question.sort_order,
      });
    } else {
      setFormData({
        question_text: "",
        question_type: "multiple_choice",
        options: ["", "", "", ""],
        correct_answer: [],
        points: 1,
        explanation: "",
        sort_order: 1,
      });
    }
  }, [question, isOpen]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const questionData = {
        quiz_id: quizId,
        question_text: formData.question_text,
        question_type: formData.question_type,
        options: formData.question_type === "multiple_choice" ? formData.options.filter(o => o.trim()) : null,
        correct_answer: formData.correct_answer,
        points: formData.points,
        explanation: formData.explanation || null,
        sort_order: formData.sort_order,
      };

      if (question) {
        await updateQuestion(question.id, questionData);
      } else {
        await createQuestion(questionData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving question:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index: number) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    const newCorrectAnswer = formData.correct_answer.filter(a => parseInt(a) !== index);
    setFormData({ ...formData, options: newOptions, correct_answer: newCorrectAnswer });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Frage bearbeiten" : "Neue Frage erstellen"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="question_type">Frage-Typ *</Label>
            <Select
              value={formData.question_type}
              onValueChange={(value: any) =>
                setFormData({
                  ...formData,
                  question_type: value,
                  options: value === "multiple_choice" ? ["", "", "", ""] : [],
                  correct_answer: [],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">Wahr/Falsch</SelectItem>
                <SelectItem value="short_answer">Freitext</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="question_text">Frage *</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="Fragetext eingeben..."
              rows={3}
            />
          </div>

          {formData.question_type === "multiple_choice" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Antwortoptionen *</Label>
                <Button onClick={addOption} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Option hinzufügen
                </Button>
              </div>
              <RadioGroup
                value={formData.correct_answer[0]}
                onValueChange={(value) =>
                  setFormData({ ...formData, correct_answer: [value] })
                }
              >
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Wähle die richtige Antwort durch Klick auf den Radio-Button
              </p>
            </div>
          )}

          {formData.question_type === "true_false" && (
            <div>
              <Label>Richtige Antwort *</Label>
              <RadioGroup
                value={formData.correct_answer[0]}
                onValueChange={(value) =>
                  setFormData({ ...formData, correct_answer: [value] })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">Wahr</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">Falsch</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {formData.question_type === "short_answer" && (
            <div>
              <Label htmlFor="correct_answer">Erwartete Antwort *</Label>
              <Input
                id="correct_answer"
                value={formData.correct_answer[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, correct_answer: [e.target.value] })
                }
                placeholder="Erwartete Antwort (für Vergleich)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Freitextantworten müssen manuell bewertet werden
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="points">Punkte *</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: parseInt(e.target.value) })
              }
            />
          </div>

          <div>
            <Label htmlFor="explanation">Erklärung (optional)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              placeholder="Wird nach Beantwortung angezeigt..."
              rows={2}
            />
          </div>
        </div>

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
  );
};
