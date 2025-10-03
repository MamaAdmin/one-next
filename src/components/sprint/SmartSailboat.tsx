import { Wind, Anchor, Target, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface SmartSailboatProps {
  values: {
    drivers: string;
    obstacles: string;
    goal: string;
    risks: string;
  };
  onChange: (field: keyof SmartSailboatProps["values"], value: string) => void;
}

export const SmartSailboat = ({ values, onChange }: SmartSailboatProps) => {
  const quadrants = [
    {
      key: "drivers" as const,
      title: "Treiber (Wind)",
      description: "Was treibt uns an? Was gibt uns Rückenwind?",
      icon: Wind,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      key: "obstacles" as const,
      title: "Hindernisse (Anker)",
      description: "Was hält uns zurück? Was bremst uns?",
      icon: Anchor,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      key: "goal" as const,
      title: "Zielzustand (Insel)",
      description: "Wo wollen wir hin? Was ist unser ideales Ergebnis?",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      key: "risks" as const,
      title: "Risiken (Felsen)",
      description: "Was könnte schiefgehen? Welche Gefahren gibt es?",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const completedCount = Object.values(values).filter((v) => v.trim().length > 0).length;
  const progressPercentage = (completedCount / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Smart Sailboat Fortschritt
          </span>
          <span className="text-sm text-muted-foreground">
            {completedCount}/4 Quadranten
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </Card>

      {/* Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => {
          const Icon = quadrant.icon;
          return (
            <Card key={quadrant.key} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${quadrant.bgColor}`}>
                    <Icon className={`h-5 w-5 ${quadrant.color}`} />
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      {quadrant.title}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quadrant.description}
                    </p>
                  </div>
                </div>

                {/* Textarea */}
                <Textarea
                  value={values[quadrant.key]}
                  onChange={(e) => onChange(quadrant.key, e.target.value)}
                  placeholder="Deine Gedanken hier eintragen..."
                  className="min-h-[120px] resize-none"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
