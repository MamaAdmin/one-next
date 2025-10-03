import { useState } from "react";
import { Timer, Upload, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Crazy8GridProps {
  sketches: Array<{ id: number; content: string }>;
  onChange: (id: number, content: string) => void;
  timerActive?: boolean;
  onStartTimer?: () => void;
}

export const Crazy8Grid = ({
  sketches,
  onChange,
  timerActive = false,
  onStartTimer,
}: Crazy8GridProps) => {
  const [activeCell, setActiveCell] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Timer Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Crazy 8 Challenge</h3>
              <p className="text-sm text-muted-foreground">
                8 Ideen in 8 Minuten – eine Minute pro Sketch
              </p>
            </div>
          </div>
          {onStartTimer && (
            <Button
              variant={timerActive ? "secondary" : "default"}
              onClick={onStartTimer}
              disabled={timerActive}
            >
              {timerActive ? "Timer läuft..." : "Timer starten"}
            </Button>
          )}
        </div>
      </Card>

      {/* 8-Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sketches.map((sketch) => (
          <Card
            key={sketch.id}
            className={`p-4 relative transition-all hover:shadow-md ${
              activeCell === sketch.id ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="space-y-3">
              {/* Cell Number Badge */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  Idee {sketch.id}
                </Badge>
                {sketch.content.trim() && (
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                )}
              </div>

              {/* Sketch Area */}
              <Textarea
                value={sketch.content}
                onChange={(e) => onChange(sketch.id, e.target.value)}
                onFocus={() => setActiveCell(sketch.id)}
                onBlur={() => setActiveCell(null)}
                placeholder="Skizziere deine Idee..."
                className="min-h-[150px] resize-none text-sm"
              />

              {/* Upload Option */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                Bild hochladen
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Completion Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {sketches.filter((s) => s.content.trim()).length} von 8 Ideen erfasst
          </span>
          {sketches.filter((s) => s.content.trim()).length === 8 && (
            <Badge variant="default">Alle Sketches komplett! 🎉</Badge>
          )}
        </div>
      </Card>
    </div>
  );
};
