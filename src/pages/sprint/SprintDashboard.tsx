import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Sparkles, Compass, Share2 } from "lucide-react";
import { useMySprints } from "@/hooks/useSprint";
import { useMyFramingSessions } from "@/hooks/useFraming";
import { getStepDef } from "@/features/sprint/steps";
import { FRAMING_STEPS } from "@/features/framing/steps";
import { SEO } from "@/components/SEO";
import SprintBasicsEditDialog from "@/components/sprint/SprintBasicsEditDialog";
import ShareSprintDialog from "@/components/sprint/ShareSprintDialog";
import ShareFramingDialog from "@/components/sprint/ShareFramingDialog";
import type { SprintRow } from "@/features/sprint/types";

export default function SprintDashboard() {
  const { data: sprints, isLoading } = useMySprints();
  const { data: framingSessions } = useMyFramingSessions();
  const [editing, setEditing] = useState<SprintRow | null>(null);
  const [sharing, setSharing] = useState<SprintRow | null>(null);
  const [sharingFramingId, setSharingFramingId] = useState<string | null>(null);
  const allFramings = framingSessions ?? [];
  const framingBySprintId = new Map(
    allFramings
      .filter((f) => f.resulting_sprint_id)
      .map((f) => [f.resulting_sprint_id as string, f]),
  );

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
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
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
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg" variant="outline">
                <Link to="/sprint/neu?mode=framing">
                  <Compass className="w-5 h-5 mr-2" />
                  Problem Herausarbeiten (Framing) (3–4 h)
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
                <Link to="/sprint/neu">
                  <Plus className="w-5 h-5 mr-2" />
                  Neuen Sprint anlegen
                </Link>
              </Button>
            </div>
          </div>

          <section className="mb-10 grid md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-5 space-y-2">
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
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Framing teilen"
                        className="absolute top-3 right-20 h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSharingFramingId(f.id);
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
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
                const step = getStepDef(s.current_step);
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
                      </CardContent>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sprint teilen"
                      className="absolute top-3 right-32 h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSharing(s);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
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
                  </Card>
                );
              })}
            </div>
          )}
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
      {sharing ? (
        <ShareSprintDialog
          sprintId={sharing.id}
          open={!!sharing}
          onOpenChange={(o) => !o && setSharing(null)}
        />
      ) : null}
      {sharingFramingId ? (
        <ShareFramingDialog
          sessionId={sharingFramingId}
          open={!!sharingFramingId}
          onOpenChange={(o) => !o && setSharingFramingId(null)}
        />
      ) : null}
    </>
  );
}
