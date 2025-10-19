import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wind, Ship, Anchor, Mountain, X, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sailboatImage from "@/assets/smart-sailboat.png";
interface SailboatData {
  wind: string[];
  hafen: string[];
  anker: string[];
  eisberg: string[];
}
type QuadrantId = keyof SailboatData;
interface QuadrantCardProps {
  id: QuadrantId;
  title: string;
  color: 'blue' | 'green' | 'amber' | 'red';
  icon: React.ReactNode;
  questions: string[];
  entries: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}
const STORAGE_KEY = 'smart-sailboat-data';
const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    hover: 'hover:bg-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    hover: 'hover:bg-green-100'
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    hover: 'hover:bg-amber-100'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    hover: 'hover:bg-red-100'
  }
};
function QuadrantCard({
  id,
  title,
  color,
  icon,
  questions,
  entries,
  inputValue,
  onInputChange,
  onAdd,
  onRemove
}: QuadrantCardProps) {
  const classes = colorClasses[color];
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onAdd();
    }
  };
  return <Card className={`${classes.border} border-2`}>
      <CardHeader className={`${classes.bg} ${classes.text}`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className={classes.text}>
          {questions.map((q, idx) => <div key={idx} className="text-sm mt-1">{q}</div>)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {entries.length > 0 && <ul className="space-y-2 mb-4">
            {entries.map((entry, index) => <li key={index} className={`flex items-start gap-2 p-2 rounded ${classes.bg} ${classes.text}`}>
                <span className="flex-1 text-sm">{entry}</span>
                <Button variant="ghost" size="sm" onClick={() => onRemove(index)} className={`h-6 w-6 p-0 ${classes.hover}`}>
                  <X className="h-4 w-4" />
                </Button>
              </li>)}
          </ul>}
        
        <div className="flex gap-2">
          <Input value={inputValue} onChange={e => onInputChange(e.target.value)} onKeyPress={handleKeyPress} placeholder="Neuen Punkt hinzufügen..." className="flex-1" />
          <Button onClick={onAdd} disabled={!inputValue.trim()} size="sm">
            Hinzufügen
          </Button>
        </div>
      </CardContent>
    </Card>;
}
export function SmartSailboat() {
  const {
    toast
  } = useToast();
  const [sailboatData, setSailboatData] = useState<SailboatData>({
    wind: [],
    hafen: [],
    anker: [],
    eisberg: []
  });
  const [inputs, setInputs] = useState({
    wind: "",
    hafen: "",
    anker: "",
    eisberg: ""
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSailboatData(parsed);
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sailboatData));
  }, [sailboatData]);
  const addEntry = (quadrant: QuadrantId, text: string) => {
    if (!text.trim()) return;
    setSailboatData(prev => ({
      ...prev,
      [quadrant]: [...prev[quadrant], text.trim()]
    }));
    setInputs(prev => ({
      ...prev,
      [quadrant]: ""
    }));
    toast({
      title: "Eintrag hinzugefügt",
      description: `Neuer Punkt wurde zu "${quadrant}" hinzugefügt.`
    });
  };
  const removeEntry = (quadrant: QuadrantId, index: number) => {
    setSailboatData(prev => ({
      ...prev,
      [quadrant]: prev[quadrant].filter((_, i) => i !== index)
    }));
  };
  const exportAsMarkdown = () => {
    const markdown = `# Smart Sailboat Discovery

Exportiert am: ${new Date().toLocaleDateString('de-DE')}

## 🌬️ Wind (Was treibt uns voran?)
${sailboatData.wind.length > 0 ? sailboatData.wind.map(item => `- ${item}`).join('\n') : '- Keine Einträge'}

## ⚓ Hafen (Wohin wollen wir?)
${sailboatData.hafen.length > 0 ? sailboatData.hafen.map(item => `- ${item}`).join('\n') : '- Keine Einträge'}

## ⚓ Anker (Was hält uns zurück?)
${sailboatData.anker.length > 0 ? sailboatData.anker.map(item => `- ${item}`).join('\n') : '- Keine Einträge'}

## 🧊 Eisberg (Welche Risiken gibt es?)
${sailboatData.eisberg.length > 0 ? sailboatData.eisberg.map(item => `- ${item}`).join('\n') : '- Keine Einträge'}
`;
    const blob = new Blob([markdown], {
      type: 'text/markdown'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-sailboat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Export erfolgreich",
      description: "Daten wurden als Markdown-Datei exportiert."
    });
  };
  const exportAsJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      toolType: "smart-sailboat",
      data: sailboatData
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-sailboat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Export erfolgreich",
      description: "Daten wurden als JSON-Datei exportiert."
    });
  };
  const resetAll = () => {
    if (confirm('Möchten Sie wirklich alle Einträge löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      setSailboatData({
        wind: [],
        hafen: [],
        anker: [],
        eisberg: []
      });
      setInputs({
        wind: "",
        hafen: "",
        anker: "",
        eisberg: ""
      });
      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: "Zurückgesetzt",
        description: "Alle Einträge wurden gelöscht."
      });
    }
  };
  return <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Smart Sailboat Discovery</CardTitle>
          <CardDescription className="text-base">
            Welches sind die potenziell wichtigsten Probleme, mit denen wir Zeit für das Framing aufwenden können? 
            Mit anderen Worten: Welche Probleme sind gute Probleme, die man beim Problem Framing durchlaufen sollte?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            
          </div>
        </CardContent>
      </Card>

      {/* Quadranten Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <QuadrantCard id="wind" title="Wind" color="blue" icon={<Wind className="h-5 w-5" />} questions={["Was treibt uns in Richtung Hafen?", "Was hat gut für uns funktioniert?"]} entries={sailboatData.wind} inputValue={inputs.wind} onInputChange={value => setInputs({
        ...inputs,
        wind: value
      })} onAdd={() => addEntry('wind', inputs.wind)} onRemove={index => removeEntry('wind', index)} />

        <QuadrantCard id="hafen" title="Hafen" color="green" icon={<Ship className="h-5 w-5" />} questions={["Welchen Bestimmungsort verlassen?", "Um wo zu landen?"]} entries={sailboatData.hafen} inputValue={inputs.hafen} onInputChange={value => setInputs({
        ...inputs,
        hafen: value
      })} onAdd={() => addEntry('hafen', inputs.hafen)} onRemove={index => removeEntry('hafen', index)} />

        <QuadrantCard id="anker" title="Anker" color="amber" icon={<Anchor className="h-5 w-5" />} questions={["Was hält uns auf?", "Was sollten wir lösen oder erneuern?"]} entries={sailboatData.anker} inputValue={inputs.anker} onInputChange={value => setInputs({
        ...inputs,
        anker: value
      })} onAdd={() => addEntry('anker', inputs.anker)} onRemove={index => removeEntry('anker', index)} />

        <QuadrantCard id="eisberg" title="Eisberg" color="red" icon={<Mountain className="h-5 w-5" />} questions={["Welchen Bedrohungen sind wir ausgesetzt?", "Was für zukünftige Risiken sollten wir bedenken?"]} entries={sailboatData.eisberg} inputValue={inputs.eisberg} onInputChange={value => setInputs({
        ...inputs,
        eisberg: value
      })} onAdd={() => addEntry('eisberg', inputs.eisberg)} onRemove={index => removeEntry('eisberg', index)} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={exportAsMarkdown} className="gap-2">
          <Download className="h-4 w-4" />
          Als Markdown exportieren
        </Button>
        <Button onClick={exportAsJSON} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Als JSON exportieren
        </Button>
        <Button onClick={resetAll} variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Alle löschen
        </Button>
      </div>
    </div>;
}