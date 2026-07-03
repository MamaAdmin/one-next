import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Sparkles, Compass, Trash2 } from "lucide-react";
import {
  useMySprints,
  useMySprintsCompletedSteps,
  useMySprintDeleteCount,
  useDeleteSprint,
  MAX_SPRINT_RESTARTS,
} from "@/hooks/useSprint";
import { useMyFramingSessions } from "@/hooks/useFraming";
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
    if (!deleting) return;
    try {
      await deleteMut.mutateAsync({
        sprintId: deleting.id,
        incrementCounter: !isAdmin,
      });
      toast({ title: "Sprint gelöscht" });
      setDeleting(null);
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

        <main className="flex-1 container mx-auto px-6 py-16 max-w-5xl">
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

          <section className="mb-10 grid md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-primary flex flex-col">
              <CardContent className="p-5 space-y-2 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Starte mit Problem Framing (3–4 h)</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Wenn dein Problem noch <strong>unscharf</strong> ist: Zielgruppe, Kontext oder
                  Erfolgskriterien sind unklar, es gibt viele Meinungen und keine gemeinsame
                  Sicht. Das Framing schärft in 3–4 Stunden Ausgangslage, Stakeholder,
                  Zielbild und leitet daraus eine konkrete Sprint-Frage ab.
                </p>
                <p className="text-xs text-muted-foreground">
                  Typisch: „Wir wissen, dass etwas nicht rund läuft, aber nicht genau was."
                </p>
                <div className="pt-3 mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/sprint/neu?mode=framing">
                      <Compass className="w-4 h-4 mr-2" />
                      Jetzt mit Problem Framing starten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent flex flex-col">
              <CardContent className="p-5 space-y-2 flex-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Starte mit Design Sprint (8h)</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Wenn du eine <strong>klare Sprint-Frage</strong> und definierte Zielgruppe
                  hast. Der Sprint führt dich durch Map, Sketch, Decide, Prototype und Test –
                  bis zu einem getesteten Prototyp mit echtem Nutzerfeedback.
                </p>
                <p className="text-xs text-muted-foreground">
                  Typisch: „Wir wissen, was wir lösen wollen – jetzt brauchen wir eine Lösung."
                </p>
                <div className="pt-3 mt-auto">
                  <Button asChild className="w-full bg-gradient-primary hover:opacity-90">
                    <Link to="/sprint/neu">
                      <Plus className="w-4 h-4 mr-2" />
                      Jetzt Design Sprint starten
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>



          {allFramings.length > 0 ? (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Compass className="w-5 h-5" /> Problem-Framing-Workshops
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {allFramings.map((f) => {
                  const fStep = FRAMING_STEPS.find((s) => s.index === f.current_step);
                  const isDone = f.status === "done";
                  const isArchived = f.status === "archived";
                  return (
                    <Card key={f.id} className="h-full hover:shadow-hover transition-shadow relative">
                      <Link to={`/sprint/framing/${f.id}`} className="block">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xl font-semibold leading-tight pr-16">
                              {f.titel_arbeitstitel || "Ohne Titel"}
                            </h3>
                            <Badge
                              variant={
                                isDone ? "secondary" : isArchived ? "outline" : "default"
                              }
                            >
                              {isDone ? "Abgeschlossen" : isArchived ? "Archiviert" : "Aktiv"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {isDone
                              ? "Framing abgeschlossen – Ergebnisse einsehbar."
                              : isArchived
                                ? "Framing archiviert."
                                : "Framing läuft – weiterarbeiten und daraus einen Sprint erzeugen."}
                          </p>
                          {!isDone && !isArchived ? (
                            <div className="text-sm text-muted-foreground pt-2">
                              Aktueller Schritt:{" "}
                              <span className="font-medium text-foreground">
                                {fStep ? fStep.title : `Schritt ${f.current_step}`}
                              </span>{" "}
                              <span className="text-xs">
                                ({f.current_step} / {FRAMING_STEPS.length})
                              </span>
                            </div>
                          ) : null}
                          <div className="text-xs text-muted-foreground">Modus: Problem Framing</div>
                        </CardContent>
                      </Link>
                    </Card>
                  );
                })}
              </div>
            </section>
          ) : null}



          {isLoading ? (
            <p className="text-muted-foreground">Wird geladen …</p>
          ) : !sprints || sprints.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-2xl font-semibold">Noch kein Sprint angelegt</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Lege deinen ersten Online Design Sprint an. Du wirst Schritt für Schritt
                  durch Map, Sketch, Decide, Prototype und Test geführt.
                </p>
                <Button asChild className="bg-gradient-primary hover:opacity-90">
                  <Link to="/sprint/neu">Ersten Sprint starten</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {sprints.map((s) => {
                const derivedKey = deriveCurrentStepKey(s.id, s.current_step);
                const step = getStepDef(derivedKey);
                const framing = framingBySprintId.get(s.id);
                return (
                  <Card key={s.id} className="h-full hover:shadow-hover transition-shadow relative">
                    <Link to={`/sprint/${s.id}`} className="block">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-semibold leading-tight pr-16">{s.titel}</h3>
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
                        <div className="text-sm text-muted-foreground pt-2">
                          {step ? (
                            <>
                              Aktueller Schritt:{" "}
                              <span className="font-medium text-foreground">{step.title}</span>
                            </>
                          ) : (
                            <>Schritt {s.current_step}</>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Modus: {s.modus === "solo" ? "Solo (KI ersetzt Team)" : "Team"}
                        </div>
                        {framing ? (
                          <Link
                            to={`/sprint/framing/${framing.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                          >
                            <Compass className="h-3.5 w-3.5" />
                            Aus Problem Framing
                          </Link>
                        ) : null}
                      </CardContent>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sprint bearbeiten"
                      className="absolute top-3 right-20 h-8 w-8"
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
                        className="absolute top-3 right-11 h-8 w-8 text-destructive hover:text-destructive"
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
              })}
            </div>
          )}

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
              onClick={handleDelete}
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
