import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSprintSession } from "@/hooks/useSprintSession";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Rocket, Target, Trophy, Flame, CheckCircle, ArrowRight } from "lucide-react";
import { SprintDashboard } from "@/components/sprint/SprintDashboard";

export default function SprintIndex() {
  const navigate = useNavigate();
  const { session, loading, createNewSession } = useSprintSession();
  const [showWelcome, setShowWelcome] = useState(!session);
  const [teamNameInput, setTeamNameInput] = useState("");

  const handleStartSprint = async () => {
    if (!teamNameInput.trim()) return;
    await createNewSession(teamNameInput);
    setShowWelcome(false);
    navigate("/sprint/session");
  };

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

  // Welcome Screen for new users
  if (!session || showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 px-4">
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
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Was dich erwartet
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Geführte Fragen & Übungen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Digitale Templates & Canvas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Automatische Ergebnisse & Sprint-Report
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  6 Tage strukturierter Prozess (Tag 0-5)
                </li>
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
      </div>
    );
  }

  // Dashboard for existing users
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Back Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary">
            <Flame className="w-3 h-3 mr-1" />
            Sprint läuft
          </Badge>
          <h1 className="text-4xl font-bold">Willkommen zurück!</h1>
          <p className="text-muted-foreground">
            Setze deinen Sprint fort und erreiche deine Ziele
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fortschritt</p>
                <p className="text-2xl font-bold">{session.completion_percentage}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold">{session.streak_days} Tage</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{session.achievements?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="w-full justify-between"
              onClick={() => navigate("/sprint/session")}
            >
              <span className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Sprint fortsetzen
              </span>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full justify-between"
              onClick={() => navigate("/sprint/setup")}
            >
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Team Setup
              </span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Aktueller Stand</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Tag {session.current_day}</p>
                <p className="text-sm text-muted-foreground">
                  {["Problem Framing", "Map", "Sketch", "Decide", "Prototype", "Test"][session.current_day]}
                </p>
              </div>
              <Badge variant="secondary">In Bearbeitung</Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(session.current_day / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
