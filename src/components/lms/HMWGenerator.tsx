import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw, Copy, Trash2, Info, Lightbulb, GripVertical, ChevronDown, X, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionParts {
  verb: string;
  object: string;
  goal: string;
}

const wordCategories = {
  validation: {
    label: "Validierung / Erlaubnis",
    words: ["ermöglichen", "erlauben", "zulassen", "befähigen", "freigeben", "bestätigen", "legitimieren", "autorisieren"]
  },
  collaboration: {
    label: "Zusammenarbeit",
    words: ["unterstützen", "begleiten", "zusammenarbeiten mit", "erklären", "anleiten", "vermitteln", "koordinieren", "moderieren"]
  },
  mindset: {
    label: "Mindset / Erfahrung",
    words: ["aufklären", "erkennen lassen", "befähigen", "ermutigen", "motivieren", "sensibilisieren", "inspirieren", "stärken"]
  },
  creation: {
    label: "Kreation / Entwicklung",
    words: ["umsetzen", "realisieren", "einrichten", "ermöglichen", "gestalten", "entwickeln", "schaffen", "etablieren"]
  },
  identification: {
    label: "Identifikation",
    words: ["klären", "entscheiden", "lösen", "bestimmen", "identifizieren", "herausfinden", "definieren", "analysieren"]
  },
  achievement: {
    label: "Ergebnis / Erfolg",
    words: ["erreichen", "erlangen", "gewinnen", "erzielen", "sichern", "verwirklichen", "optimieren", "verbessern"]
  }
};

const objectWords = [
  "unseren Kunden",
  "Kollegen",
  "das Team",
  "Nutzer",
  "Stakeholder",
  "die Organisation",
  "Partner",
  "Entscheider",
  "die Zielgruppe",
  "Mitarbeiter"
];

const goalWords = [
  "etwas erreichen, das ihnen wichtig ist",
  "ihre Ziele zu verwirklichen",
  "erfolgreich zu sein",
  "Probleme zu lösen",
  "innovativ zu handeln",
  "schneller voranzukommen",
  "bessere Entscheidungen zu treffen",
  "effizienter zu arbeiten",
  "ihre Vision umzusetzen",
  "nachhaltig zu wachsen"
];

export function HMWGenerator() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<QuestionParts>({
    verb: "",
    object: "",
    goal: ""
  });
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<string>("");
  const [activeDropZone, setActiveDropZone] = useState<string>("");

  // Load saved questions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hmw-questions");
    if (saved) {
      try {
        setSavedQuestions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved questions", e);
      }
    }
  }, []);

  // Save questions to localStorage
  useEffect(() => {
    if (savedQuestions.length > 0) {
      localStorage.setItem("hmw-questions", JSON.stringify(savedQuestions.slice(0, 20)));
    }
  }, [savedQuestions]);

  const generateQuestion = () => {
    if (!question.object || !question.verb || !question.goal) return "";
    return `Wie können wir ${question.object} ${question.verb}, ${question.goal}?`;
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDragOver = (e: React.DragEvent, field: string) => {
    if (!draggedWord) return;
    e.preventDefault();
    setActiveDropZone(field);
  };

  const handleDragLeave = () => {
    setActiveDropZone("");
  };

  const handleDrop = (e: React.DragEvent, field: keyof QuestionParts) => {
    if (!draggedWord) return;
    e.preventDefault();
    setQuestion(prev => ({ ...prev, [field]: draggedWord }));
    setDraggedWord("");
    setActiveDropZone("");
  };

  const handleClick = (field: keyof QuestionParts, word: string) => {
    setQuestion(prev => ({ ...prev, [field]: word }));
  };

  const saveQuestion = () => {
    const newQuestion = generateQuestion();
    if (!newQuestion) {
      toast({
        title: "Unvollständig",
        description: "Bitte fülle alle Felder aus, bevor du die Frage speicherst.",
        variant: "destructive"
      });
      return;
    }
    setSavedQuestions(prev => [newQuestion, ...prev]);
    toast({
      title: "Gespeichert!",
      description: "Deine Frage wurde gespeichert."
    });
  };

  const resetQuestion = () => {
    setQuestion({ object: "", verb: "", goal: "" });
  };

  const clearField = (field: keyof QuestionParts) => {
    setQuestion(prev => ({ ...prev, [field]: "" }));
  };

  const handleTextInput = (field: keyof QuestionParts, value: string) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert!",
      description: "Die Frage wurde in die Zwischenablage kopiert."
    });
  };

  const deleteQuestion = (index: number) => {
    setSavedQuestions(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Gelöscht",
      description: "Die Frage wurde entfernt."
    });
  };

  const DraggableWord = ({ word, onClick }: { word: string; onClick?: () => void }) => (
    <Badge
      variant="secondary"
      className="cursor-move hover:bg-secondary/80 transition-colors px-3 py-1"
      draggable
      onDragStart={() => handleDragStart(word)}
      onClick={onClick}
    >
      <GripVertical className="h-3 w-3 mr-1 opacity-50" />
      {word}
    </Badge>
  );

  const DropZone = ({ field, value, label }: { field: keyof QuestionParts; value: string; label: string }) => (
    <div className="space-y-2 flex-1">
      <Label htmlFor={`field-${field}`} className="text-sm font-medium">{label}</Label>
      <div 
        className={`
          relative
          ${activeDropZone === field ? 'ring-2 ring-primary ring-offset-2' : ''}
        `}
        onDragOver={(e) => handleDragOver(e, field)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, field)}
      >
        <Input
          id={`field-${field}`}
          placeholder="Ziehe ein Wort hierher oder gib Text ein..."
          value={value}
          onChange={(e) => handleTextInput(field, e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className={`
            pr-10
            ${activeDropZone === field ? 'border-primary bg-primary/5' : ''}
          `}
        />
        {value && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-destructive/10"
            onClick={() => clearField(field)}
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left Column: Fixed Question Builder */}
      <div className="space-y-6">
        {/* Example Banner */}
        <Alert className="bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800">
          <Info className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <AlertTitle className="text-pink-900 dark:text-pink-100">Beispiel:</AlertTitle>
          <AlertDescription className="text-pink-700 dark:text-pink-300">
            Wie können wir <strong>unseren Kunden</strong> <strong>ermöglichen</strong>, <strong>ihre Ziele zu erreichen</strong>?
          </AlertDescription>
        </Alert>

        {/* Question Builder */}
        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>Konstruiere deine Frage</CardTitle>
            <CardDescription>
              Ziehe Wörter von rechts in die Felder oder gib eigenen Text ein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-lg font-medium">Wie können wir...</div>
              
              {/* Reihenfolge: Objekt, Verb, Ziel */}
              <DropZone field="object" value={question.object} label="1. Objekt / Zielgruppe" />
              <DropZone field="verb" value={question.verb} label="2. Verb / Aktion" />
              <DropZone field="goal" value={question.goal} label="3. Ziel / Ergebnis" />

              <div className="text-lg font-medium">?</div>
            </div>

            {/* Live Preview */}
            <Alert className="bg-accent min-h-[72px] items-start">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Deine Frage:</AlertTitle>
              <AlertDescription className="text-base font-medium">
                Wie können wir {question.object || "…"} {question.verb || "…"}, {question.goal || "…"}?
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={saveQuestion} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
              <Button variant="outline" onClick={resetQuestion}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Saved Questions */}
        {savedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>Gespeicherte Fragen ({savedQuestions.length})</CardTitle>
                  <CardDescription>
                    Deine gesammelten "Wie könnten wir..."-Fragen
                  </CardDescription>
                </div>
                <Button onClick={() => navigate('/lms/tools/hmw-clustering')} size="sm">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Fragen clustern
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                {savedQuestions.map((q, i) => (
                  <li key={i} className="flex items-start justify-between gap-2 p-3 rounded-md bg-muted/50">
                    <span className="text-sm flex-1">{q}</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => copyToClipboard(q)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteQuestion(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column: Word Library */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Wort-Bibliothek</CardTitle>
            <CardDescription>
              Ziehe Wörter nach links oder klicke darauf
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Objects */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-accent/50 p-2 rounded-md transition-colors">
                <ChevronDown className="h-4 w-4" />
                <h4 className="font-medium text-sm">1. Zielgruppen / Objekte</h4>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pl-6">
                <div className="flex flex-wrap gap-2">
                  {objectWords.map(word => (
                    <DraggableWord
                      key={word}
                      word={word}
                      onClick={() => handleClick('object', word)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Verb Categories */}
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-4">
              2. Verben / Aktionen
            </div>
            {Object.entries(wordCategories).map(([key, category]) => (
              <Collapsible key={key} defaultOpen={key === 'validation'}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-accent/50 p-2 rounded-md transition-colors">
                  <ChevronDown className="h-4 w-4" />
                  <h4 className="font-medium text-sm">{category.label}</h4>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pl-6">
                  <div className="flex flex-wrap gap-2">
                    {category.words.map(word => (
                      <DraggableWord
                        key={word}
                        word={word}
                        onClick={() => handleClick('verb', word)}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {/* Goals */}
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-accent/50 p-2 rounded-md transition-colors">
                <ChevronDown className="h-4 w-4" />
                <h4 className="font-medium text-sm">3. Ziele / Ergebnisse</h4>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pl-6">
                <div className="flex flex-wrap gap-2">
                  {goalWords.map(word => (
                    <DraggableWord
                      key={word}
                      word={word}
                      onClick={() => handleClick('goal', word)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
