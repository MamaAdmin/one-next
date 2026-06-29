import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Dot } from "lucide-react";
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

  const sprint = sprintQ.data;
  const steps = stepsQ.data ?? [];
  const currentKey = sprint?.current_step ?? "1.1";
  const currentDef = getStepDef(currentKey);

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
    await setCurrentStep.mutateAsync(stepKey);
  }

  const nextKey = getNextStepKey(currentKey);
  const prevKey = getPrevStepKey(currentKey);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 container mx-auto px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Side-Nav */}
          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
            <Link
              to="/sprint"
              className="text-sm text-muted-foreground hover:underline block"
            >
              ← Übersicht
            </Link>
            <div>
              <h2 className="text-xl font-bold leading-tight">{sprint.titel}</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Modus: {sprint.modus === "solo" ? "Solo" : "Team"}
              </p>
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
                    </ul>
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Step card */}
          <div className="space-y-6">
            {/* Note: Etappe 1 zeigt eine einheitliche Standard-Karte für alle Schritte.
                Spezialansichten (Map, Crazy 8s, Scorecard etc.) folgen in Etappe 2/3. */}
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

            {/* Tages-One-Pager: erscheint automatisch beim letzten Schritt des Tages,
                sobald dieser abgeschlossen wurde. */}
            {DAY_LAST_STEP[currentDef.day] === currentKey && currentRow?.completed_at ? (
              <SprintDaySummary
                sprint={sprint}
                day={currentDef.day}
                allSteps={steps}
              />
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
