import { Lock, CheckCircle2, Circle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Day {
  number: number;
  title: string;
  status: "locked" | "in-progress" | "completed" | "perfect";
}

interface DayNavigationTabsProps {
  days: Day[];
  currentDay: number;
  onDayChange: (day: number) => void;
}

export const DayNavigationTabs = ({
  days,
  currentDay,
  onDayChange,
}: DayNavigationTabsProps) => {
  const getStatusIcon = (status: Day["status"]) => {
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

  const getStatusBadgeVariant = (status: Day["status"]) => {
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
        <Tabs value={currentDay.toString()} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-transparent p-2">
            {days.map((day) => (
              <TabsTrigger
                key={day.number}
                value={day.number.toString()}
                onClick={() => onDayChange(day.number)}
                disabled={day.status === "locked"}
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {getStatusIcon(day.status)}
                <span className="hidden sm:inline">Tag {day.number}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {day.title}
                </span>
                {day.status !== "locked" && day.status !== "in-progress" && (
                  <Badge
                    variant={getStatusBadgeVariant(day.status)}
                    className="ml-1 h-5 px-1.5 text-[10px]"
                  >
                    {day.status === "perfect" ? "Perfekt" : "✓"}
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
