import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Dot, FileText, Pencil } from "lucide-react";
import { useSprint, useSprintSteps, useSaveStep, useSetCurrentStep } from "@/hooks/useSprint";
import {
  SPRINT_STEPS,
  DAYS,
  getStepDef,
  getNextStepKey,
  getPrevStepKey,
} from "@/features/sprint/steps";
import SprintStepCard from "@/components/sprint/SprintStepCard";
import SprintDaySummary from "@/components/sprint/SprintDaySummary";
import SprintBasicsEditDialog from "@/components/sprint/SprintBasicsEditDialog";


import type { SprintStepData } from "@/features/sprint/types";


const DAY_LAST_STEP: Record<number, string> = {
  1: "1.11",
  2: "2.5",
  3: "3.6",
  4: "4.1",
  5: "5.4",
};

export default function SprintWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sprintQ = useSprint(id);
  const stepsQ = useSprintSteps(id);
  const saveStep = useSaveStep(id ?? "");
  const setCurrentStep = useSetCurrentStep(id ?? "");
  const [summaryDay, setSummaryDay] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);


  const sprint = sprintQ.data;
  const steps = stepsQ.data ?? [];
  const currentKey = sprint?.current_step ?? "1.1";
  const currentDef = getStepDef(currentKey);

  // Kickoff-Guard: bevor der Sprint startet, muss der Kickoff bestätigt sein.
  useEffect(() => {
    if (sprint && !sprint.kickoff_confirmed_at) {
      navigate(`/sprint/${sprint.id}/kickoff`, { replace: true });
    }
  }, [sprint, navigate]);

  const currentRow = useMemo(
    () => steps.find((s) => s.step_key === currentKey),
    [steps, currentKey],
  );

  const totalIndex = SPRINT_STEPS.findIndex((s) => s.key === currentKey);

  if (sprintQ.isLoading) {
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

  if (!sprint || !currentDef) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-6 py-20 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Sprint nicht gefunden</h1>
          <Button asChild>
            <Link to="/sprint">Zur Übersicht</Link>
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  async function handleSave(data: SprintStepData, opts?: { completed?: boolean }) {
    await saveStep.mutateAsync({
      step_key: currentKey,
      data,
      completed: opts?.completed,
    });
  }

  async function goTo(stepKey: string) {
    setSummaryDay(null);
    await setCurrentStep.mutateAsync(stepKey);
  }

  function openSummary(day: number) {
    setSummaryDay(day);
  }

  const nextKey = getNextStepKey(currentKey);
  const prevKey = getPrevStepKey(currentKey);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 w-full px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-16">
        <div className="grid md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-6 lg:gap-8">
          {/* Side-Nav */}
          <aside className="md:sticky md:top-24 md:self-start space-y-4">
            <Link
              to="/sprint"
              className="text-sm text-muted-foreground hover:underline block"
            >
              ← Übersicht
            </Link>
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold leading-tight">{sprint.titel}</h2>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setEditOpen(true)}
                    title="Sprint-Grundlagen bearbeiten"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Modus: {sprint.modus === "solo" ? "Solo" : "Team"}
              </p>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Titel & Problemstellung bearbeiten
              </button>
            </div>


            <nav className="space-y-4">
              {DAYS.map((d) => {
                const dayStepDefs = SPRINT_STEPS.filter((s) => s.day === d.day);
                return (
                  <div key={d.day}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {d.label}
                    </div>
                    <ul className="space-y-0.5">
                      {dayStepDefs.map((def) => {
                        const row = steps.find((s) => s.step_key === def.key);
                        const isCurrent = def.key === currentKey;
                        const done = !!row?.completed_at;
                        return (
                          <li key={def.key}>
                            <button
                              type="button"
                              onClick={() => goTo(def.key)}
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
                              <span>{def.title}</span>
                            </button>
                          </li>
                        );
                      })}
                      {DAY_LAST_STEP[d.day] ? (() => {
                        const lastKey = DAY_LAST_STEP[d.day];
                        const lastDone = !!steps.find((s) => s.step_key === lastKey)?.completed_at;
                        const isCurrent = summaryDay === d.day;
                        return (
                          <li>
                            <button
                              type="button"
                              disabled={!lastDone}
                              onClick={() => openSummary(d.day)}
                              className={`w-full flex items-start gap-2 text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                                isCurrent
                                  ? "bg-primary/10 text-primary font-medium"
                                  : lastDone
                                    ? "hover:bg-muted"
                                    : "opacity-50 cursor-not-allowed"
                              }`}
                              title={lastDone ? "Tages-Zusammenfassung" : "Verfügbar nach Abschluss des letzten Schritts"}
                            >
                              <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                              <span>One Pager · Tag {d.day}</span>
                            </button>
                          </li>
                        );
                      })() : null}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Step card or One Pager */}
          <div className="space-y-6">

            {summaryDay !== null ? (
              <SprintDaySummary
                sprint={sprint}
                day={summaryDay as 1 | 2 | 3 | 4 | 5}
                allSteps={steps}
              />
            ) : (
              <>
                {currentDef.variant && currentDef.variant !== "checkbox-list" && currentDef.variant !== "map" ? (
                  <Card className="border-dashed">
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-2">
                        Spezialansicht folgt
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Für diesen Schritt (Variante: <code>{currentDef.variant}</code>) ist eine
                        eigene Ansicht geplant. Du kannst jetzt schon Antworten als Liste sammeln
                        und im nächsten Build-Schritt wird die passende UI ergänzt.
                      </p>
                    </CardContent>
                  </Card>
                ) : null}

                <SprintStepCard
                  sprint={sprint}
                  step={currentDef}
                  stepRow={currentRow}
                  allSteps={steps}
                  totalIndex={totalIndex}
                  totalCount={SPRINT_STEPS.length}
                  onSave={handleSave}
                  onPrev={prevKey ? () => goTo(prevKey) : undefined}
                  onNext={nextKey ? () => goTo(nextKey) : undefined}
                />

                {/* Hinweis-Button: Wenn letzter Tagesschritt abgeschlossen → zum One Pager springen */}
                {DAY_LAST_STEP[currentDef.day] === currentKey && currentRow?.completed_at ? (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => openSummary(currentDef.day)}>
                      <FileText className="w-4 h-4 mr-2" />
                      One Pager · Tag {currentDef.day} öffnen
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>

      <SprintBasicsEditDialog sprint={sprint} open={editOpen} onOpenChange={setEditOpen} />
      

      <Footer />
    </div>

  );
}
