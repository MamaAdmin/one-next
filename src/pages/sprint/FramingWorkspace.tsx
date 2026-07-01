import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Dot, Timer, Play, Pause, RotateCcw, Flag } from "lucide-react";
import {
  useFramingSession,
  useFramingSteps,
  useSaveFramingStep,
  useSetFramingCurrentStep,
} from "@/hooks/useFraming";
import { FRAMING_STEPS, FRAMING_TOTAL_MIN, getFramingStepByIndex } from "@/features/framing/steps";
import FramingStepCard from "@/components/framing/FramingStepCard";
import FramingCompletionPanel from "@/components/framing/FramingCompletionPanel";
import type { FramingStepData } from "@/features/framing/types";

export default function FramingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionQ = useFramingSession(id);
  const stepsQ = useFramingSteps(id);
  const saveStep = useSaveFramingStep(id ?? "");
  const setCurrent = useSetFramingCurrentStep(id ?? "");
  const [showCompletion, setShowCompletion] = useState(false);

  const session = sessionQ.data;
  const steps = stepsQ.data ?? [];

  const currentIndex = session?.current_step ?? 1;
  const currentDef = getFramingStepByIndex(currentIndex) ?? FRAMING_STEPS[0];
  const currentRow = steps.find((s) => s.step_key === currentDef.key);

  // Timer
  const [secondsLeft, setSecondsLeft] = useState(currentDef.timeboxMin * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(currentDef.timeboxMin * 60);
    setRunning(false);
    setShowCompletion(false);
  }, [currentDef.key]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const completedCount = steps.filter((s) => !!s.completed_at).length;
  const progressPct = (completedCount / FRAMING_STEPS.length) * 100;

  async function handleSave(data: FramingStepData, opts?: { completed?: boolean }) {
    await saveStep.mutateAsync({ step_key: currentDef.key, data, completed: opts?.completed });
  }

  async function goTo(idx: number) {
    setShowCompletion(false);
    await setCurrent.mutateAsync(idx);
  }

  async function handleNext() {
    if (currentDef.index === 10) {
      setShowCompletion(true);
      return;
    }
    await goTo(currentDef.index + 1);
  }

  async function handlePrev() {
    if (currentDef.index === 1) return;
    await goTo(currentDef.index - 1);
  }

  if (sessionQ.isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Wird geladen …
        </div>
        <Footer />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Framing-Session nicht gefunden</h1>
          <Button asChild>
            <Link to="/sprint">Zur Übersicht</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const timeboxOver = secondsLeft === 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 container mx-auto px-6 py-10 lg:py-16">
        <div className="mb-6">
          <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
            ← Sprint-Übersicht
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
            <div>
              <Badge variant="secondary" className="mb-1">Problem-Framing-Workshop</Badge>
              <h1 className="text-3xl font-bold">
                {session.titel_arbeitstitel || "Ohne Titel"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Schritt {currentDef.index} von 10 · gesamte Timebox ~{Math.round(FRAMING_TOTAL_MIN / 60 * 10) / 10} h
              </p>
            </div>
            {!showCompletion ? (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 bg-background ${timeboxOver ? "border-destructive text-destructive" : ""}`}>
                <Timer className="w-4 h-4" />
                <span className="font-mono text-lg tabular-nums">{mm}:{ss}</span>
                <Button size="icon" variant="ghost" onClick={() => setRunning((r) => !r)}>
                  {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setSecondsLeft(currentDef.timeboxMin * 60);
                    setRunning(false);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          </div>
          <div className="mt-3">
            <Progress value={progressPct} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="space-y-1">
              {FRAMING_STEPS.map((def) => {
                const row = steps.find((s) => s.step_key === def.key);
                const done = !!row?.completed_at;
                const isCurrent = def.key === currentDef.key && !showCompletion;
                return (
                  <button
                    key={def.key}
                    type="button"
                    onClick={() => goTo(def.index)}
                    className={`w-full flex items-start gap-2 text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                      isCurrent
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    ) : isCurrent ? (
                      <Dot className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span>
                      <span className="text-xs text-muted-foreground block">
                        {def.timeboxMin}′
                      </span>
                      {def.title}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowCompletion(true)}
                disabled={completedCount < 10}
                className={`w-full flex items-start gap-2 text-left text-sm px-2 py-1.5 rounded-md transition-colors mt-2 ${
                  showCompletion
                    ? "bg-primary/10 text-primary font-medium"
                    : completedCount >= 10
                      ? "hover:bg-muted"
                      : "opacity-50 cursor-not-allowed"
                }`}
              >
                <Flag className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Abschluss · Challenge Statement</span>
              </button>
            </nav>
          </aside>

          <div className="space-y-6">
            {showCompletion ? (
              <FramingCompletionPanel session={session} steps={steps} />
            ) : (
              <>
                <FramingStepCard
                  sessionId={session.id}
                  step={currentDef}
                  stepRow={currentRow}
                  allSteps={steps}
                  onSave={handleSave}
                  onPrev={currentDef.index > 1 ? handlePrev : undefined}
                  onNext={handleNext}
                />
                {currentDef.nutztDatenAus.length > 0 ? (
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                        Kontext aus vorherigen Schritten
                      </div>
                      <ul className="text-sm space-y-1">
                        {currentDef.nutztDatenAus.map((k) => {
                          const def = getFramingStep(k);
                          const row = steps.find((s) => s.step_key === k);
                          const done = !!row?.completed_at;
                          return (
                            <li key={k} className="flex items-center gap-2">
                              {done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                              )}
                              <span className="text-muted-foreground">{def?.title}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
