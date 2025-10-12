import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SprintProgressHeader } from "@/components/sprint/SprintProgressHeader";
import { PhaseNavigationTabs } from "@/components/sprint/PhaseNavigationTabs";
import { TaskChecklistCard } from "@/components/sprint/TaskChecklistCard";
import { AchievementModal } from "@/components/sprint/AchievementModal";
import { SmartSailboat } from "@/components/sprint/SmartSailboat";
import { Crazy8Grid } from "@/components/sprint/Crazy8Grid";
import { JourneyMap } from "@/components/sprint/JourneyMap";
import { StoryboardEditor } from "@/components/sprint/StoryboardEditor";
import { useSprintSession } from "@/hooks/useSprintSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function SprintSession() {
  const navigate = useNavigate();
  const { session, loading, saving, updateChallengeData, toggleTask, advanceToPhase } = useSprintSession();
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  const phases = [
    { number: 1, title: "Problemdefinition", status: (session?.current_phase === 1 ? "in-progress" : session && session.current_phase > 1 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 2, title: "Mapping", status: (session && session.current_phase === 2 ? "in-progress" : session && session.current_phase > 2 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 3, title: "Skizzieren", status: (session && session.current_phase === 3 ? "in-progress" : session && session.current_phase > 3 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 4, title: "Entscheiden", status: (session && session.current_phase === 4 ? "in-progress" : session && session.current_phase > 4 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 5, title: "Prototyp", status: (session && session.current_phase === 5 ? "in-progress" : session && session.current_phase > 5 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 6, title: "Testen", status: (session && session.current_phase === 6 ? "in-progress" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Sprint-Session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Keine aktive Session</h2>
          <p className="text-muted-foreground mb-6">
            Bitte starte zuerst einen neuen Sprint
          </p>
          <Button onClick={() => navigate("/sprint")}>
            Zum Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentPhase = session.current_phase;

  return (
    <div className="min-h-screen pt-20">
      {/* Progress Header */}
      <SprintProgressHeader
        teamName={session.team_name}
        currentPhase={currentPhase}
        completionPercentage={session.completion_percentage}
        streakDays={session.streak_days}
      />

      {/* Phase Navigation */}
      <PhaseNavigationTabs
        phases={phases}
        currentPhase={currentPhase}
        onPhaseChange={(phase) => advanceToPhase(phase)}
      />

      {/* Main Content */}
      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Phase 1: Problem Framing */}
          {currentPhase === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 1: Problemdefinition</h1>
                <p className="text-xl text-muted-foreground">
                  Definiere die Challenge und den Zielzustand
                </p>
              </div>

              <SmartSailboat
                values={session.challenge_data?.sailboat || { drivers: "", obstacles: "", goal: "", risks: "" }}
                onChange={(field, value) => {
                  const updatedSailboat = {
                    ...(session.challenge_data?.sailboat || {}),
                    [field]: value,
                  };
                  updateChallengeData("sailboat", updatedSailboat);
                }}
              />

              <TaskChecklistCard
                title="Phase 1 Aufgaben"
                tasks={[
                  { id: "phase1-1", title: "Smart Sailboat komplett ausfüllen", completed: session.task_completion?.["phase1-1"] || false },
                  { id: "phase1-2", title: "1-2 Challenges priorisieren", completed: session.task_completion?.["phase1-2"] || false },
                ]}
                onTaskToggle={toggleTask}
                saving={saving}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToPhase(2)}>
                  Weiter zu Phase 2
                  <Target className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Phase 2: Map */}
          {currentPhase === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 2: Mapping</h1>
                <p className="text-xl text-muted-foreground">
                  Erstelle die Customer Journey Map
                </p>
              </div>

              <JourneyMap
                touchpoints={session.challenge_data?.journeyMap || []}
                onChange={(touchpoints) => updateChallengeData("journeyMap", touchpoints)}
              />

              <TaskChecklistCard
                title="Phase 2 Aufgaben"
                tasks={[
                  { id: "phase2-1", title: "Langfristziel definieren", completed: session.task_completion?.["phase2-1"] || false },
                  { id: "phase2-2", title: "Journey Map erstellen", completed: session.task_completion?.["phase2-2"] || false },
                  { id: "phase2-3", title: "HMW-Fragen sammeln", completed: session.task_completion?.["phase2-3"] || false },
                ]}
                onTaskToggle={toggleTask}
                saving={saving}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToPhase(3)}>
                  Weiter zu Phase 3
                </Button>
              </div>
            </div>
          )}

          {/* Phase 3: Sketch */}
          {currentPhase === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 3: Skizzieren</h1>
                <p className="text-xl text-muted-foreground">
                  Skizziere 8 Lösungsideen
                </p>
              </div>

              <Crazy8Grid
                sketches={session.challenge_data?.crazy8 || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, content: "" }))}
                onChange={(id, content) => {
                  const sketches = session.challenge_data?.crazy8 || Array.from({ length: 8 }, (_, i) => ({ id: i + 1, content: "" }));
                  const updated = sketches.map((s: any) => s.id === id ? { ...s, content } : s);
                  updateChallengeData("crazy8", updated);
                }}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToPhase(4)}>
                  Weiter zu Phase 4
                </Button>
              </div>
            </div>
          )}

          {/* Phase 4: Decide */}
          {currentPhase === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 4: Entscheiden</h1>
                <p className="text-xl text-muted-foreground">
                  Wähle die beste Idee und erstelle ein Storyboard
                </p>
              </div>

              <StoryboardEditor
                panels={session.challenge_data?.storyboard || Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: "", description: "" }))}
                onChange={(panels) => updateChallengeData("storyboard", panels)}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToPhase(5)}>
                  Weiter zu Phase 5
                </Button>
              </div>
            </div>
          )}

          {/* Phase 5: Prototype */}
          {currentPhase === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 5: Prototyp</h1>
                <p className="text-xl text-muted-foreground">
                  Erstelle einen testbaren Prototyp
                </p>
              </div>

              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Prototyping-Phase wird in Kürze verfügbar sein
                </p>
                <Button onClick={() => advanceToPhase(6)}>
                  Weiter zu Phase 6
                </Button>
              </Card>
            </div>
          )}

          {/* Phase 6: Test */}
          {currentPhase === 6 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Phase 6: Testen</h1>
                <p className="text-xl text-muted-foreground">
                  Teste deinen Prototyp mit echten Usern
                </p>
              </div>

              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Test-Phase wird in Kürze verfügbar sein
                </p>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Achievement Modal */}
      <AchievementModal
        open={showAchievement}
        onClose={() => setShowAchievement(false)}
        achievement={currentAchievement}
      />
    </div>
  );
}
