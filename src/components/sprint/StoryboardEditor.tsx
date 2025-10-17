import { useState } from "react";
import { BookOpen, Plus, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Panel {
  id: number;
  title: string;
  description: string;
}

interface StoryboardEditorProps {
  panels: Panel[];
  onChange: (panels: Panel[]) => void;
}

export const StoryboardEditor = ({ panels, onChange }: StoryboardEditorProps) => {
  const [activePanel, setActivePanel] = useState<number | null>(null);

  const updatePanel = (id: number, updates: Partial<Panel>) => {
    onChange(panels.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const completedPanels = panels.filter(
    (p) => p.title.trim() && p.description.trim()
  ).length;
  const progressPercentage = (completedPanels / panels.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">Storyboard Editor</h3>
                <p className="text-sm text-muted-foreground">
                  6-Panel Story für deinen Prototyp
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              {completedPanels}/{panels.length} komplett
            </Badge>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* 6-Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {panels.map((panel) => {
          const isActive = activePanel === panel.id;
          const isComplete = panel.title.trim() && panel.description.trim();

          return (
            <Card
              key={panel.id}
              className={`p-4 transition-all ${
                isActive ? "ring-2 ring-primary shadow-lg" : ""
              } ${isComplete ? "bg-accent/50" : ""}`}
            >
              <div className="space-y-3">
                {/* Panel Number & Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={isComplete ? "default" : "secondary"}
                    className="text-xs"
                  >
                    Panel {panel.id}
                  </Badge>
                  {isComplete && (
                    <span className="text-xs text-green-500">✓</span>
                  )}
                </div>

                {/* Title Input */}
                <Textarea
                  value={panel.title}
                  onChange={(e) => updatePanel(panel.id, { title: e.target.value })}
                  onFocus={() => setActivePanel(panel.id)}
                  onBlur={() => setActivePanel(null)}
                  placeholder="Titel des Panels..."
                  className="min-h-[60px] resize-none text-sm font-semibold"
                />

                {/* Description Input */}
                <Textarea
                  value={panel.description}
                  onChange={(e) =>
                    updatePanel(panel.id, { description: e.target.value })
                  }
                  onFocus={() => setActivePanel(panel.id)}
                  onBlur={() => setActivePanel(null)}
                  placeholder="Was passiert hier? Beschreibe die Szene..."
                  className="min-h-[100px] resize-none text-sm"
                />

                {/* Image Upload */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Sketch hochladen
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedPanels === panels.length && (
        <Card className="p-6 bg-primary/5 text-center">
          <h4 className="font-semibold text-lg mb-2">
            Storyboard komplett! 🎉
          </h4>
          <p className="text-sm text-muted-foreground">
            Deine Story ist bereit für das Prototyping
          </p>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          <strong>Tipp:</strong> Ein gutes Storyboard zeigt den User-Flow vom
          Einstieg bis zum erfolgreichen Abschluss der Aufgabe. Überlege bei jedem
          Panel: Was sieht der User? Was tut er? Was ist das Ergebnis?
        </p>
      </Card>
    </div>
  );
};
