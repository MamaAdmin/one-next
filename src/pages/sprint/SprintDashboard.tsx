import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Sparkles, Compass, Trash2, ChevronRight } from "lucide-react";
import {
  useMySprints,
  useMySprintsCompletedSteps,
  useMySprintDeleteCount,
  useDeleteSprint,
  MAX_SPRINT_RESTARTS,
} from "@/hooks/useSprint";
import { useMyFramingSessions, useDeleteFramingSession } from "@/hooks/useFraming";
import type { FramingSessionRow } from "@/features/framing/types";
import { useAdmin } from "@/hooks/useAdmin";
import { getStepDef, SPRINT_STEPS } from "@/features/sprint/steps";
import { FRAMING_STEPS } from "@/features/framing/steps";
import { SEO } from "@/components/SEO";
import SprintBasicsEditDialog from "@/components/sprint/SprintBasicsEditDialog";
import type { SprintRow } from "@/features/sprint/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export default function SprintDashboard() {
  const { data: sprints, isLoading } = useMySprints();
  const { data: framingSessions } = useMyFramingSessions();
  const { data: deleteCount = 0 } = useMySprintDeleteCount();
  const { isAdmin } = useAdmin();
  const deleteMut = useDeleteSprint();
  const sprintIds = (sprints ?? []).map((s) => s.id);
  const { data: completedByStep } = useMySprintsCompletedSteps(sprintIds);
  const [editing, setEditing] = useState<SprintRow | null>(null);
  const [deleting, setDeleting] = useState<SprintRow | null>(null);
  const [confirmingFinalDelete, setConfirmingFinalDelete] = useState<SprintRow | null>(null);
  const [deletingFraming, setDeletingFraming] = useState<FramingSessionRow | null>(null);
  const deleteFramingMut = useDeleteFramingSession();
  const allFramings = framingSessions ?? [];
  const framingBySprintId = new Map(
    allFramings
      .filter((f) => f.resulting_sprint_id)
      .map((f) => [f.resulting_sprint_id as string, f]),
  );

  const remainingRestarts = Math.max(0, MAX_SPRINT_RESTARTS - deleteCount);
  const canDelete = (s: SprintRow) =>
    s.status !== "done" && (isAdmin || remainingRestarts > 0);

  const handleDelete = async () => {
    const target = confirmingFinalDelete;
    if (!target) return;
    try {
      await deleteMut.mutateAsync({
        sprintId: target.id,
        incrementCounter: !isAdmin,
      });
      toast({
        title: "Sprint gelöscht",
        description: isAdmin
          ? "Als Admin kannst du ihn im Admin-Bereich wiederherstellen."
          : undefined,
      });
      setConfirmingFinalDelete(null);
      setDeleting(null);
    } catch (e) {
      toast({
        title: "Löschen fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFraming = async () => {
    if (!deletingFraming) return;
    try {
      await deleteFramingMut.mutateAsync(deletingFraming.id);
      toast({ title: "Problem Framing gelöscht" });
      setDeletingFraming(null);
    } catch (e) {
      toast({
        title: "Löschen fehlgeschlagen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  const deriveCurrentStepKey = (sprintId: string, fallback: string): string => {
    const done = new Set(completedByStep?.[sprintId] ?? []);
    if (done.size === 0) return fallback;
    const nextOpen = SPRINT_STEPS.find((s) => !done.has(s.key));
    return nextOpen ? nextOpen.key : SPRINT_STEPS[SPRINT_STEPS.length - 1].key;
  };

  return (
    <>
      <SEO
        title="Meine Design Sprints | one-next"
        description="Übersicht und Verwaltung deiner Online Design Sprints."
        canonical="https://one-next.de/sprint"
      />
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1 w-full px-6 py-16">
          <div className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-bold">
              Meine{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Design Sprints
              </span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Selbstgeführte Online Design Sprints – flexibel, mit KI-Unterstützung.
            </p>
          </div>

          <section className="mb-10">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">Neuen Sprint starten</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Jeder Sprint beginnt mit einem kurzen <strong>Problem Framing</strong>
                  {" "}(10 Schritte, ca. 3–4 h). So schärfst du Zielgruppe, Kontext,
                  Risiken und Zielfragen – am Ende entsteht automatisch dein Sprint mit
                  vorbefülltem Challenge Statement und klaren Sprint-Fragen.
                </p>
                <div className="pt-2">
                  <Button asChild className="bg-gradient-primary hover:opacity-90">
                    <Link to="/sprint/neu">
                      <Compass className="w-4 h-4 mr-2" />
                      Mit Problem Framing starten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>




          {(() => {
            const sprintById = new Map((sprints ?? []).map((s) => [s.id, s]));
            const pairs: Array<{ framing: typeof allFramings[number]; sprint: SprintRow }> = [];
            const loneFramings: typeof allFramings = [];
            const pairedSprintIds = new Set<string>();
            for (const f of allFramings) {
              const linkedSprint = f.resulting_sprint_id ? sprintById.get(f.resulting_sprint_id) : undefined;
              if (linkedSprint) {
                pairs.push({ framing: f, sprint: linkedSprint });
                pairedSprintIds.add(linkedSprint.id);
              } else {
                loneFramings.push(f);
              }
            }
            const loneSprints = (sprints ?? []).filter((s) => !pairedSprintIds.has(s.id));

            const renderFramingSub = (
              f: typeof allFramings[number],
              opts: { hasVisibleSprint: boolean } = { hasVisibleSprint: false },
            ) => {
              const fStep = FRAMING_STEPS.find((s) => s.index === f.current_step);
              const isDone = f.status === "done";
              const isArchived = f.status === "archived";
              const canDeleteFraming = !opts.hasVisibleSprint;
              return (
                <Card className="h-full hover:shadow-hover transition-shadow border-l-4 border-l-primary/60 relative">
                  <Link to={`/sprint/framing/${f.id}`} className="block h-full">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                        <Compass className="h-3.5 w-3.5" />
                        Problem Framing
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-semibold leading-tight pr-10">
                          {f.titel_arbeitstitel || "Ohne Titel"}
                        </h4>
                        <Badge
                          variant={isDone ? "secondary" : isArchived ? "outline" : "default"}
                        >
                          {isDone ? "Abgeschlossen" : isArchived ? "Archiviert" : "Aktiv"}
                        </Badge>
                      </div>
                      {!isDone && !isArchived ? (
                        <div className="text-sm text-muted-foreground pt-1">
                          Schritt{" "}
                          <span className="font-medium text-foreground">
                            {fStep ? fStep.title : f.current_step}
                          </span>{" "}
                          <span className="text-xs">
                            ({f.current_step} / {FRAMING_STEPS.length})
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isDone
                            ? "Framing abgeschlossen – Ergebnisse einsehbar."
                            : "Framing archiviert."}
                        </p>
                      )}
                    </CardContent>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Problem Framing löschen"
                    disabled={!canDeleteFraming}
                    title={
                      canDeleteFraming
                        ? "Problem Framing löschen"
                        : "Erst den zugehörigen Sprint löschen, dann kann dieses Framing entfernt werden."
                    }
                    className="absolute top-3 right-3 h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (canDeleteFraming) setDeletingFraming(f);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>

              );
            };

            const renderSprintSub = (s: SprintRow) => {
              const derivedKey = deriveCurrentStepKey(s.id, s.current_step);
              const step = getStepDef(derivedKey);
              return (
                <Card className="h-full hover:shadow-hover transition-shadow border-l-4 border-l-accent relative">
                  <Link to={`/sprint/${s.id}`} className="block h-full">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Design Sprint
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-base font-semibold leading-tight pr-24">{s.titel}</h4>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>
                          {s.status === "active"
                            ? "Aktiv"
                            : s.status === "done"
                              ? "Abgeschlossen"
                              : "Archiviert"}
                        </Badge>
                      </div>
                      {s.problemstellung ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {s.problemstellung}
                        </p>
                      ) : null}
                      <div className="text-sm text-muted-foreground pt-1">
                        {step ? (
                          <>
                            Schritt{" "}
                            <span className="font-medium text-foreground">{step.title}</span>
                          </>
                        ) : (
                          <>Schritt {s.current_step}</>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Modus: {s.modus === "solo" ? "Solo (KI ersetzt Team)" : "Team"}
                      </div>
                    </CardContent>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Sprint bearbeiten"
                    className="absolute top-3 right-24 h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditing(s);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {s.status !== "done" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sprint löschen"
                      disabled={!canDelete(s)}
                      title={
                        !canDelete(s)
                          ? "Maximal 3 Neuanfänge – keine Löschung mehr möglich."
                          : "Sprint löschen"
                      }
                      className="absolute top-3 right-32 h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (canDelete(s)) setDeleting(s);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </Card>
              );
            };

            const renderFramingPlaceholder = (f: typeof allFramings[number]) => (
              <Card className="h-full border-dashed border-l-4 border-l-accent/40 bg-muted/20">
                <CardContent className="p-5 space-y-2 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Design Sprint
                  </div>
                  {f.status === "done" ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Framing abgeschlossen – jetzt kannst du den Sprint daraus starten.
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="w-fit bg-gradient-primary hover:opacity-90"
                      >
                        <Link to={`/sprint/framing/${f.id}`}>
                          <Plus className="h-4 w-4 mr-1.5" />
                          Sprint aus Framing erzeugen
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sprint entsteht nach Abschluss des Problem Framings.
                    </p>
                  )}
                </CardContent>
              </Card>
            );

            const hasVorhaben = pairs.length > 0 || loneFramings.length > 0;

            return (
              <>
                {isLoading ? (
                  <p className="text-muted-foreground">Wird geladen …</p>
                ) : null}

                {hasVorhaben ? (
                  <section className="mb-10 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Compass className="w-5 h-5" /> Meine Vorhaben
                    </h2>

                    {pairs.map(({ framing, sprint }) => (
                      <div
                        key={`pair-${framing.id}`}
                        className="rounded-xl border bg-muted/30 p-4 md:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 px-1">
                          <div className="text-sm font-semibold text-foreground">
                            Vorhaben:{" "}
                            <span className="text-primary">
                              {framing.titel_arbeitstitel || sprint.titel}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Framing → Sprint
                          </span>
                        </div>
                        <div className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                          {renderFramingSub(framing, { hasVisibleSprint: true })}
                          <div className="hidden md:flex items-center justify-center text-muted-foreground">
                            <ChevronRight className="h-6 w-6" />
                          </div>
                          {renderSprintSub(sprint)}
                        </div>
                      </div>
                    ))}

                    {loneFramings.map((f) => (
                      <div
                        key={`lone-framing-${f.id}`}
                        className="rounded-xl border bg-muted/30 p-4 md:p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 px-1">
                          <div className="text-sm font-semibold text-foreground">
                            Vorhaben:{" "}
                            <span className="text-primary">
                              {f.titel_arbeitstitel || "Ohne Titel"}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Framing → Sprint
                          </span>
                        </div>
                        <div className="grid md:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                          {renderFramingSub(f)}
                          <div className="hidden md:flex items-center justify-center text-muted-foreground">
                            <ChevronRight className="h-6 w-6" />
                          </div>
                          {renderFramingPlaceholder(f)}
                        </div>
                      </div>
                    ))}
                  </section>
                ) : null}

                {loneSprints.length > 0 ? (
                  <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Direkt gestartete Sprints
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {loneSprints.map((s) => renderSprintSub(s))}
                    </div>
                  </section>
                ) : null}

                {!isLoading && !hasVorhaben && loneSprints.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-12 text-center space-y-4">
                      <Sparkles className="w-12 h-12 mx-auto text-primary" />
                      <h2 className="text-2xl font-semibold">Noch kein Vorhaben angelegt</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Lege dein erstes Vorhaben an – entweder direkt als Design Sprint oder
                        starte mit einem Problem Framing.
                      </p>
                      <Button asChild className="bg-gradient-primary hover:opacity-90">
                        <Link to="/sprint/neu">Ersten Sprint starten</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            );
          })()}


          {!isAdmin && sprints && sprints.length > 0 ? (
            <p className="text-xs text-muted-foreground mt-4">
              Hinweis: Du kannst laufende Sprints löschen und neu anfangen –
              maximal {MAX_SPRINT_RESTARTS} Neuanfänge. Bereits genutzt:{" "}
              {Math.min(deleteCount, MAX_SPRINT_RESTARTS)} / {MAX_SPRINT_RESTARTS}.
            </p>
          ) : null}
        </main>

        <Footer />
      </div>

      {editing ? (
        <SprintBasicsEditDialog
          sprint={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sprint wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleting?.titel}" wird unwiderruflich gelöscht – inklusive aller Schritte und Inhalte.
              {!isAdmin ? (
                <>
                  {" "}Danach hast du noch{" "}
                  <strong>{Math.max(0, remainingRestarts - 1)} von {MAX_SPRINT_RESTARTS}</strong>{" "}
                  Neuanfängen übrig.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) {
                  setConfirmingFinalDelete(deleting);
                  setDeleting(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Weiter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmingFinalDelete}
        onOpenChange={(o) => !o && setConfirmingFinalDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wirklich endgültig löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Letzte Sicherheitsabfrage: „{confirmingFinalDelete?.titel}" wird jetzt gelöscht.
              {isAdmin ? (
                <> Als Admin kannst du den Sprint im Admin-Bereich wiederherstellen.</>
              ) : (
                <> Nur ein Admin kann den Sprint danach noch wiederherstellen.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingFraming}
        onOpenChange={(o) => !o && setDeletingFraming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Problem Framing wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deletingFraming?.titel_arbeitstitel || "Ohne Titel"}" wird unwiderruflich
              gelöscht – inklusive aller Antworten und Zwischenstände. Diese Aktion kann
              nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFraming}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
