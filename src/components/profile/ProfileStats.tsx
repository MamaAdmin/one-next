import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Flame, TrendingUp } from "lucide-react";

interface ProfileStatsProps {
  totalCourses: number;
  completedCourses: number;
  streak: number;
  achievements: number;
}

export const ProfileStats = ({
  totalCourses,
  completedCourses,
  streak,
  achievements,
}: ProfileStatsProps) => {
  const stats = [
    {
      title: "Eingeschriebene Kurse",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Abgeschlossene Kurse",
      value: completedCourses,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Erfolgsserie",
      value: streak,
      icon: Flame,
      color: "text-orange-600",
    },
    {
      title: "Erfolge",
      value: achievements,
      icon: Award,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
