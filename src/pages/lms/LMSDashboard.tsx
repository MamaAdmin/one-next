import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Link } from "react-router-dom";
import { Play, Trophy, Flame, Award, CheckCircle, Brain } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { categoryLabels } from "@/lib/categoryMappings";

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export default function LMSDashboard() {
  const { currentEnrollment, loading } = useLMSEnrollment();
  const { isBmadUser, isAdmin } = useUserRoles();
  const [streak, setStreak] = useState(0);
  const [, setParticipantId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "first_phase", icon: "🎯", title: "Erste Phase!", description: "Phase 1 abgeschlossen", unlocked: false },
    { id: "artifact_10", icon: "📦", title: "10 Artifacts", description: "10 Artifacts hochgeladen", unlocked: false },
    { id: "streak_7", icon: "🔥", title: "7-Tage Streak", description: "7 Tage in Folge aktiv", unlocked: false },
    { id: "all_phases", icon: "🏆", title: "Sprint Master", description: "Alle 5 Phasen abgeschlossen", unlocked: false },
  ]);

  // Load real streak and achievements
  useEffect(() => {
    const loadGamificationData = async () => {
      if (!currentEnrollment) return;
      
      setParticipantId(currentEnrollment.participant_id);
      
      // Load streak
      const { data: streakData } = await (supabase as any).rpc("calculate_streak", {
        p_participant_id: currentEnrollment.participant_id
      });
      setStreak(streakData || 0);
      
      // Load achievements
      const { data: achievementsData } = await supabase
        .from("lms_achievements")
        .select("achievement_type")
        .eq("participant_id", currentEnrollment.participant_id);
      
      const unlockedTypes = new Set(achievementsData?.map(a => a.achievement_type) || []);
      
      setAchievements(prev => prev.map(a => ({
        ...a,
        unlocked: unlockedTypes.has(a.id)
      })));
    };
    
    loadGamificationData();
  }, [currentEnrollment]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mein Dashboard</h1>

          {/* BMAD Portal Card */}
          {(isBmadUser || isAdmin) && (
            <Card className="mb-6 border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle>BMAD Portal</CardTitle>
                      <CardDescription>Business Model Agile Development</CardDescription>
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/bmad">
                      <Brain className="mr-2 h-4 w-4" />
                      Zum BMAD Portal
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {currentEnrollment && (
            <div className="space-y-6">
              {/* Continue Learning */}
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">Learning fortsetzen</CardTitle>
                      <CardDescription>
                        {categoryLabels[currentEnrollment.current_category]}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {currentEnrollment.progress_percentage}% abgeschlossen
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={currentEnrollment.progress_percentage} className="h-3" />

                  <Button size="lg" className="w-full" asChild>
                    <Link to={`/lms/course/${currentEnrollment.id}`}>
                      <Play className="mr-2 h-5 w-5" />
                      Weiter lernen
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Stats Row */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Streak</CardTitle>
                    <Flame className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{streak} Tage 🔥</div>
                    <p className="text-xs text-muted-foreground">In Folge aktiv</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Erfolge</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {achievements.filter(a => a.unlocked).length}/{achievements.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Freigeschaltet</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Nächster Meilenstein</CardTitle>
                    <Award className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {categoryLabels[currentEnrollment.current_category]}
                    </div>
                    <p className="text-xs text-muted-foreground">Noch 2 Module</p>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Erfolge</CardTitle>
                  <CardDescription>Sammle Erfolge während deines Lernwegs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {achievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        className={`p-4 ${
                          achievement.unlocked
                            ? "border-primary bg-primary/5"
                            : "opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{achievement.title}</h4>
                              {achievement.unlocked && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
