import { Lock, CheckCircle2, Circle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Phase {
  number: number;
  title: string;
  status: "locked" | "in-progress" | "completed" | "perfect";
}

interface PhaseNavigationTabsProps {
  phases: Phase[];
  currentPhase: number;
  onPhaseChange: (phase: number) => void;
}

export const PhaseNavigationTabs = ({
  phases,
  currentPhase,
  onPhaseChange,
}: PhaseNavigationTabsProps) => {
  const getStatusIcon = (status: Phase["status"]) => {
    switch (status) {
      case "locked":
        return <Lock className="h-3 w-3" />;
      case "completed":
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "perfect":
        return <Award className="h-3 w-3 text-amber-500" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getStatusBadgeVariant = (status: Phase["status"]) => {
    switch (status) {
      case "locked":
        return "secondary";
      case "completed":
      case "perfect":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <Tabs value={currentPhase.toString()} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-2">
            {phases.map((phase) => (
              <TabsTrigger
                key={phase.number}
                value={phase.number.toString()}
                onClick={() => onPhaseChange(phase.number)}
                disabled={phase.status === "locked"}
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {getStatusIcon(phase.status)}
                <span className="hidden sm:inline">Phase {phase.number}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {phase.title}
                </span>
                {phase.status !== "locked" && phase.status !== "in-progress" && (
                  <Badge
                    variant={getStatusBadgeVariant(phase.status)}
                    className="ml-1 h-5 px-1.5 text-[10px]"
                  >
                    {phase.status === "perfect" ? "Perfekt" : "✓"}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
