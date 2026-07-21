import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Dot, Timer, Play, Pause, RotateCcw, Flag, Info, ChevronDown, Users } from "lucide-react";
import {
  useFramingSession,
  useFramingSteps,
  useSaveFramingStep,
  useSetFramingCurrentStep,
} from "@/hooks/useFraming";
import { FRAMING_STEPS, FRAMING_TOTAL_MIN, getFramingStepByIndex } from "@/features/framing/steps";
import FramingStepCard from "@/components/framing/FramingStepCard";
import FramingCompletionPanel from "@/components/framing/FramingCompletionPanel";
import FramingTeamGate from "@/components/framing/FramingTeamGate";
import type { FramingStepData } from "@/features/framing/types";

export default function FramingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionQ = useFramingSession(id);
  const stepsQ = useFramingSteps(id);
  const saveStep = useSaveFramingStep(id ?? "");
  const setCurrent = useSetFramingCurrentStep(id ?? "");
  const [showCompletion, setShowCompletion] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const showTeam = searchParams.get("view") === "team";

  function afterNavAction() {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setNavOpen(false);
      requestAnimationFrame(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

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

  const realSteps = FRAMING_STEPS.filter((s) => s.variant !== "intro");
  const completedCount = steps.filter((s) => !!s.completed_at && s.step_key !== "intro").length;
  const progressPct = (completedCount / realSteps.length) * 100;


  async function handleSave(data: FramingStepData, opts?: { completed?: boolean }) {
    await saveStep.mutateAsync({ step_key: currentDef.key, data, completed: opts?.completed });
  }

  function clearTeamView() {
    if (searchParams.get("view") === "team") {
      const next = new URLSearchParams(searchParams);
      next.delete("view");
      setSearchParams(next, { replace: true });
    }
  }

  function openTeamView() {
    const next = new URLSearchParams(searchParams);
    next.set("view", "team");
    setSearchParams(next, { replace: true });
    setShowCompletion(false);
    afterNavAction();
  }

  async function goTo(idx: number) {
    clearTeamView();
    setShowCompletion(false);
    await setCurrent.mutateAsync(idx);
    afterNavAction();
  }

  async function handleNext() {
    if (currentDef.index === realSteps.length) {
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

      <main className="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-16">
        <div className="mb-6">
          <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
            ← Sprint-Übersicht
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4 mt-2">
            <div>
              <Badge variant="secondary" className="mb-1">Problem-Framing-Workshop</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold break-words">
                {session.titel_arbeitstitel || "Ohne Titel"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentDef.variant === "intro"
                  ? `Einführung · gesamte Timebox ~${Math.round(FRAMING_TOTAL_MIN / 60 * 10) / 10} h`
                  : `Schritt ${currentDef.index} von ${realSteps.length} · gesamte Timebox ~${Math.round(FRAMING_TOTAL_MIN / 60 * 10) / 10} h`}
              </p>
            </div>
            {!showCompletion && currentDef.timeboxMin > 0 ? (
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

        <div className="grid md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
          <aside className="md:sticky md:top-24 md:self-start space-y-3">
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              className="lg:hidden w-full flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm"
              aria-expanded={navOpen}
            >
              <span className="truncate">
                {showCompletion
                  ? "Abschluss · Challenge Statement"
                  : `Schritt ${currentDef.index}: ${currentDef.title}`}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${navOpen ? "rotate-180" : ""}`} />
            </button>
            <nav className={`space-y-1 ${navOpen ? "block" : "hidden"} lg:block`}>
              {FRAMING_STEPS.map((def) => {
                const row = steps.find((s) => s.step_key === def.key);
                const done = !!row?.completed_at;
                const isCurrent = def.key === currentDef.key && !showCompletion;
                const isIntro = def.variant === "intro";
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
                    {isIntro ? (
                      <Info className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    ) : done ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    ) : isCurrent ? (
                      <Dot className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 mt-0.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span>
                      {isIntro ? (
                        <span className="text-xs text-muted-foreground block">Einführung</span>
                      ) : (
                        <span className="text-xs text-muted-foreground block">
                          {def.timeboxMin}′
                        </span>
                      )}
                      {def.title}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => { setShowCompletion(true); afterNavAction(); }}
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

          <div ref={contentRef} className="space-y-6 scroll-mt-20">
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
                        {currentDef.nutztDatenAus.map((k: string) => {
                          const def = FRAMING_STEPS.find((s) => s.key === k);
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
