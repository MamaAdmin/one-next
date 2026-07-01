import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Sparkles } from "lucide-react";
import { useMySprints } from "@/hooks/useSprint";
import { getStepDef } from "@/features/sprint/steps";
import { SEO } from "@/components/SEO";
import SprintBasicsEditDialog from "@/components/sprint/SprintBasicsEditDialog";
import type { SprintRow } from "@/features/sprint/types";

export default function SprintDashboard() {
  const { data: sprints, isLoading } = useMySprints();

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
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
              <Link to="/sprint/neu">
                <Plus className="w-5 h-5 mr-2" />
                Neuen Sprint anlegen
              </Link>
            </Button>
          </div>

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
                return (
                  <Link key={s.id} to={`/sprint/${s.id}`} className="block">
                    <Card className="h-full hover:shadow-hover transition-shadow">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xl font-semibold leading-tight">{s.titel}</h3>
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
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
