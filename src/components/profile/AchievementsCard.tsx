import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsCardProps {
  achievements: Achievement[];
}

export const AchievementsCard = ({ achievements }: AchievementsCardProps) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Erfolge</CardTitle>
        <CardDescription>
          {unlockedCount} von {achievements.length} freigeschaltet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`text-center ${
                achievement.unlocked ? "" : "opacity-40 grayscale"
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <p className="text-sm font-medium mb-1">{achievement.title}</p>
              <p className="text-xs text-muted-foreground mb-2">
                {achievement.description}
              </p>
              {achievement.unlocked && achievement.unlockedAt && (
                <Badge variant="secondary" className="text-xs">
                  {new Date(achievement.unlockedAt).toLocaleDateString("de-DE")}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
