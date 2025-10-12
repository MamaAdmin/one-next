import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, RotateCcw, Copy, Trash2, Info, Lightbulb, GripVertical, ChevronDown } from "lucide-react";
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
    if (!question.verb || !question.object || !question.goal) return "";
    return `Wie können wir ${question.verb} ${question.object}, ${question.goal}?`;
  };

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setActiveDropZone(field);
  };

  const handleDragLeave = () => {
    setActiveDropZone("");
  };

  const handleDrop = (e: React.DragEvent, field: keyof QuestionParts) => {
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
    setQuestion({ verb: "", object: "", goal: "" });
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

  const DropZone = ({ field, value }: { field: keyof QuestionParts; value: string }) => (
    <div
      className={`
        min-w-[150px] px-4 py-2 rounded-md border-2 border-dashed transition-all
        ${activeDropZone === field ? 'border-primary bg-primary/5 scale-105' : 'border-border'}
        ${value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted'}
      `}
      onDragOver={(e) => handleDragOver(e, field)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, field)}
    >
      {value || `[${field === 'verb' ? 'Verb' : field === 'object' ? 'Objekt' : 'Ziel'}]`}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Example Banner */}
      <Alert className="bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800">
        <Info className="h-4 w-4 text-pink-600 dark:text-pink-400" />
        <AlertTitle className="text-pink-900 dark:text-pink-100">Beispiel:</AlertTitle>
        <AlertDescription className="text-pink-700 dark:text-pink-300">
          Wie können wir <strong>unseren Kunden</strong> <strong>helfen</strong>, <strong>ihre Ziele zu erreichen</strong>?
        </AlertDescription>
      </Alert>

      {/* Question Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Konstruiere deine Frage</CardTitle>
          <CardDescription>
            Ziehe Wörter in die Felder oder klicke darauf, um sie einzufügen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-lg">
            <span className="font-medium">Wie können wir</span>
            <DropZone field="verb" value={question.verb} />
            <DropZone field="object" value={question.object} />
            <span className="font-medium">zu</span>
            <DropZone field="goal" value={question.goal} />
            <span className="font-medium text-2xl">?</span>
          </div>

          {/* Live Preview */}
          {question.verb && question.object && question.goal && (
            <Alert className="bg-accent">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Deine Frage:</AlertTitle>
              <AlertDescription className="text-base font-medium">
                {generateQuestion()}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={saveQuestion}>
              <Save className="mr-2 h-4 w-4" />
              Frage speichern
            </Button>
            <Button variant="outline" onClick={resetQuestion}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Word Library */}
      <Card>
        <CardHeader>
          <CardTitle>Wort-Bibliothek</CardTitle>
          <CardDescription>
            Wähle aus verschiedenen Kategorien oder nutze die vordefinierten Wörter unten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verb Categories */}
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

          {/* Objects */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-accent/50 p-2 rounded-md transition-colors">
              <ChevronDown className="h-4 w-4" />
              <h4 className="font-medium text-sm">Zielgruppen / Objekte</h4>
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

          {/* Goals */}
          <Collapsible defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-2 w-full hover:bg-accent/50 p-2 rounded-md transition-colors">
              <ChevronDown className="h-4 w-4" />
              <h4 className="font-medium text-sm">Ziele / Ergebnisse</h4>
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

      {/* Saved Questions */}
      {savedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gespeicherte Fragen ({savedQuestions.length})</CardTitle>
            <CardDescription>
              Deine gesammelten How-Might-We Fragen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
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
  );
}
