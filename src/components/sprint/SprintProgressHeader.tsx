import { Trophy, Target, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SprintProgressHeaderProps {
  teamName: string;
  currentDay: number;
  completionPercentage: number;
  streakDays: number;
  totalDays?: number;
}

export const SprintProgressHeader = ({
  teamName,
  currentDay,
  completionPercentage,
  streakDays,
  totalDays = 6,
}: SprintProgressHeaderProps) => {
  const estimatedTimeRemaining = (totalDays - currentDay) * 8; // 8 hours per day

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">{teamName}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Tag {currentDay}/{totalDays - 1}
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between gap-6">
          {/* Left: Title & Team */}
          <div className="flex items-center gap-4 min-w-0">
            <Target className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">Online Design Sprint 2.0</h2>
              <p className="text-xs text-muted-foreground truncate">{teamName}</p>
            </div>
          </div>

          {/* Center: Day Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalDays }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i < currentDay
                    ? "bg-primary scale-110"
                    : i === currentDay
                    ? "bg-primary animate-pulse scale-125"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Right: Stats */}
          <div className="flex items-center gap-6">
            {/* Streak */}
            {streakDays > 0 && (
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{streakDays} Tage Streak</span>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
                <span className="text-xs text-muted-foreground">
                  ~{estimatedTimeRemaining}h verbleibend
                </span>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
