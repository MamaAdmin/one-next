import { BarChart3, Calendar, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SprintDashboardProps {
  teamName: string;
  currentPhase: number;
  completionPercentage: number;
  streakDays: number;
  achievements: Array<{ id: string; title: string; icon: string }>;
  lastActiveDate: string;
  onResume: () => void;
}

export const SprintDashboard = ({
  teamName,
  currentPhase,
  completionPercentage,
  streakDays,
  achievements,
  lastActiveDate,
  onResume,
}: SprintDashboardProps) => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Welcome Back */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Willkommen zurück!</h1>
            <p className="text-muted-foreground">
              Team: <span className="font-semibold text-foreground">{teamName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Zuletzt aktiv: {new Date(lastActiveDate).toLocaleDateString("de-DE")}
            </p>
          </div>
          <Button onClick={onResume} size="lg" className="flex items-center gap-2">
            Sprint fortsetzen
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">Fortschritt</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {completionPercentage}%
              </span>
              <span className="text-sm text-muted-foreground">abgeschlossen</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Phase {currentPhase} von 6
            </p>
          </div>
        </Card>

        {/* Streak */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
            <h3 className="font-semibold">Streak</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-amber-500">
                {streakDays}
              </span>
              <span className="text-sm text-muted-foreground">Tage</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {streakDays > 0 ? "Großartig! Bleib dran! 🔥" : "Starte deinen Streak heute!"}
            </p>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="font-semibold">Erfolge</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-purple-500">
                {achievements.length}
              </span>
              <span className="text-sm text-muted-foreground">freigeschaltet</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {achievements.slice(0, 3).map((achievement) => (
                <Badge key={achievement.id} variant="secondary" className="text-xs">
                  {achievement.title}
                </Badge>
              ))}
              {achievements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{achievements.length - 3} weitere
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Nächste Schritte</h3>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={onResume}>
            Weiter bei Phase {currentPhase}
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Sprint-Report ansehen
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Team einladen
          </Button>
        </div>
      </Card>
    </div>
  );
};
