import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SprintProgressHeader } from "@/components/sprint/SprintProgressHeader";
import { DayNavigationTabs } from "@/components/sprint/DayNavigationTabs";
import { TaskChecklistCard } from "@/components/sprint/TaskChecklistCard";
import { AchievementModal } from "@/components/sprint/AchievementModal";
import { SprintDashboard } from "@/components/sprint/SprintDashboard";
import { SmartSailboat } from "@/components/sprint/SmartSailboat";
import { Crazy8Grid } from "@/components/sprint/Crazy8Grid";
import { JourneyMap } from "@/components/sprint/JourneyMap";
import { HeatmapVoting } from "@/components/sprint/HeatmapVoting";
import { StoryboardEditor } from "@/components/sprint/StoryboardEditor";
import { useSprintSession } from "@/hooks/useSprintSession";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, Target } from "lucide-react";

const OnlineDesignSprint = () => {
  const navigate = useNavigate();
  const { session, loading, saving, createNewSession, updateChallengeData, toggleTask, advanceToDay } = useSprintSession();
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [teamNameInput, setTeamNameInput] = useState("");

  const days = [
    { number: 0, title: "Problem Framing", status: (session?.current_day === 0 ? "in-progress" : session && session.current_day > 0 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 1, title: "Map", status: (session && session.current_day === 1 ? "in-progress" : session && session.current_day > 1 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 2, title: "Sketch", status: (session && session.current_day === 2 ? "in-progress" : session && session.current_day > 2 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 3, title: "Decide", status: (session && session.current_day === 3 ? "in-progress" : session && session.current_day > 3 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 4, title: "Prototype", status: (session && session.current_day === 4 ? "in-progress" : session && session.current_day > 4 ? "completed" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
    { number: 5, title: "Test", status: (session && session.current_day === 5 ? "in-progress" : "locked") as "in-progress" | "completed" | "locked" | "perfect" },
  ];

  const handleStartSprint = async () => {
    if (!teamNameInput.trim()) return;
    await createNewSession(teamNameInput);
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Sprint-Session...</p>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (!session || showWelcome) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Willkommen zum Online Design Sprint 2.0
                </h1>
                <p className="text-xl text-muted-foreground">
                  Schritt für Schritt von der Challenge zum getesteten Prototyp
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg text-left space-y-4">
                <h3 className="font-semibold text-lg">🎯 Was dich erwartet</h3>
                <ul className="space-y-2 text-sm">
                  <li>✓ Geführte Fragen & Übungen</li>
                  <li>✓ Digitale Templates & Canvas</li>
                  <li>✓ Automatische Ergebnisse & Sprint-Report</li>
                  <li>✓ 6 Tage strukturierter Prozess (Tag 0-5)</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="text-left">
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    placeholder="z.B. Innovation Squad"
                    className="mt-1"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleStartSprint}
                  disabled={!teamNameInput.trim()}
                >
                  Sprint starten
                  <Rocket className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentDay = session.current_day;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Progress Header */}
      <SprintProgressHeader
        teamName={session.team_name}
        currentDay={currentDay}
        completionPercentage={session.completion_percentage}
        streakDays={session.streak_days}
      />

      {/* Day Navigation */}
      <DayNavigationTabs
        days={days}
        currentDay={currentDay}
        onDayChange={(day) => advanceToDay(day)}
      />

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Day 0: Problem Framing */}
          {currentDay === 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 0: Problem Framing</h1>
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
                title="Tag 0 Aufgaben"
                tasks={[
                  { id: "day0-1", title: "Smart Sailboat komplett ausfüllen", completed: session.task_completion?.["day0-1"] || false },
                  { id: "day0-2", title: "1-2 Challenges priorisieren", completed: session.task_completion?.["day0-2"] || false },
                ]}
                onTaskToggle={toggleTask}
                saving={saving}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToDay(1)}>
                  Weiter zu Tag 1
                  <Target className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Day 1: Map */}
          {currentDay === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 1: Map</h1>
                <p className="text-xl text-muted-foreground">
                  Erstelle die Customer Journey Map
                </p>
              </div>

              <JourneyMap
                touchpoints={session.challenge_data?.journeyMap || []}
                onChange={(touchpoints) => updateChallengeData("journeyMap", touchpoints)}
              />

              <TaskChecklistCard
                title="Tag 1 Aufgaben"
                tasks={[
                  { id: "day1-1", title: "Langfristziel definieren", completed: session.task_completion?.["day1-1"] || false },
                  { id: "day1-2", title: "Journey Map erstellen", completed: session.task_completion?.["day1-2"] || false },
                  { id: "day1-3", title: "HMW-Fragen sammeln", completed: session.task_completion?.["day1-3"] || false },
                ]}
                onTaskToggle={toggleTask}
                saving={saving}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToDay(2)}>
                  Weiter zu Tag 2
                </Button>
              </div>
            </div>
          )}

          {/* Day 2: Sketch */}
          {currentDay === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 2: Sketch</h1>
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
                <Button size="lg" onClick={() => advanceToDay(3)}>
                  Weiter zu Tag 3
                </Button>
              </div>
            </div>
          )}

          {/* Day 3: Decide */}
          {currentDay === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 3: Decide</h1>
                <p className="text-xl text-muted-foreground">
                  Wähle die beste Idee und erstelle ein Storyboard
                </p>
              </div>

              <StoryboardEditor
                panels={session.challenge_data?.storyboard || Array.from({ length: 6 }, (_, i) => ({ id: i + 1, title: "", description: "" }))}
                onChange={(panels) => updateChallengeData("storyboard", panels)}
              />

              <div className="flex justify-end">
                <Button size="lg" onClick={() => advanceToDay(4)}>
                  Weiter zu Tag 4
                </Button>
              </div>
            </div>
          )}

          {/* Day 4: Prototype */}
          {currentDay === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 4: Prototype</h1>
                <p className="text-xl text-muted-foreground">
                  Erstelle einen testbaren Prototyp
                </p>
              </div>

              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Prototyping-Phase wird in Kürze verfügbar sein
                </p>
                <Button onClick={() => advanceToDay(5)}>
                  Weiter zu Tag 5
                </Button>
              </Card>
            </div>
          )}

          {/* Day 5: Test */}
          {currentDay === 5 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold">Tag 5: Test</h1>
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

      <Footer />
    </div>
  );
};

export default OnlineDesignSprint;
