import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Sparkles, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateFramingSession } from "@/hooks/useFraming";
import { useCreateSprint } from "@/hooks/useSprint";
import { supabase } from "@/integrations/supabase/client";

export default function SprintNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDirectSprint = searchParams.get("mode") === "sprint";
  const createFraming = useCreateFramingSession();
  const createSprint = useCreateSprint();
  const [titel, setTitel] = useState("");
  const [busy, setBusy] = useState(false);

  async function startFraming(e: React.FormEvent) {
    e.preventDefault();
    const t = titel.trim();
    if (t.length < 3) {
      toast({ title: "Arbeitstitel zu kurz", description: "Mindestens 3 Zeichen.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const framing = await createFraming.mutateAsync({ titel_arbeitstitel: t });
      const sprint = await createSprint.mutateAsync({
        titel: t,
        problemstellung: "",
        modus: "team",
        decider: "",
        sprint_leader: "",
      });
      await supabase
        .from("framing_sessions")
        .update({ resulting_sprint_id: sprint.id })
        .eq("id", framing.id);
      toast({ title: "Problem Framing gestartet", description: "Starte mit der Team-Konstellation." });
      navigate(`/sprint/framing/${framing.id}?view=team`);
    } catch (e) {
      toast({ title: "Konnte nicht gestartet werden", description: e instanceof Error ? e.message : "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function startDirectSprint(e: React.FormEvent) {
    e.preventDefault();
    const t = titel.trim();
    if (t.length < 3) {
      toast({ title: "Titel zu kurz", description: "Mindestens 3 Zeichen.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const sprint = await createSprint.mutateAsync({
        titel: t,
        problemstellung: "",
        modus: "team",
        decider: "",
        sprint_leader: "",
      });
      toast({ title: "Design Sprint gestartet", description: "Starte mit der Team-Konstellation." });
      navigate(`/sprint/${sprint.id}`);
    } catch (e) {
      toast({ title: "Konnte nicht gestartet werden", description: e instanceof Error ? e.message : "Unbekannter Fehler", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <AdminBreadcrumb items={[{ label: "Design Sprint", href: "/sprint" }, { label: "Neuer Sprint", href: "/sprint/neu", active: true }]} />

      <main className="flex-1 w-full px-6 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
            ← Zur Sprint-Übersicht
          </Link>

          {/* Modus-Auswahl */}
          <div className="mt-4 mb-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/sprint/neu"
                className={`rounded-lg border p-4 transition-colors ${!isDirectSprint ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Mit Problem Framing</span>
                </div>
                <p className="text-xs text-muted-foreground">Challenge klären, dann Sprint starten.</p>
              </Link>
              <Link
                to="/sprint/neu?mode=sprint"
                className={`rounded-lg border p-4 transition-colors ${isDirectSprint ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Direkt als Design Sprint</span>
                </div>
                <p className="text-xs text-muted-foreground">Ohne Framing direkt in den Sprint.</p>
              </Link>
            </div>
          </div>

          {isDirectSprint ? (
            <>
              <h1 className="text-4xl font-bold mb-2">
                Direkt als{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">Design Sprint</span> starten
              </h1>
              <p className="text-muted-foreground mb-8">
                Deine Challenge ist bereits klar? Starte direkt mit dem Design Sprint. Du landest
                auf der Team-Konstellation, lädst dein Team per E-Mail ein und beginnst dann mit
                Schritt 1. Das Problem Framing kannst du jederzeit nachholen.
              </p>

              <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={startDirectSprint} className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold">Design Sprint starten</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stitel">Titel für deinen Design Sprint</Label>
                      <Input
                        id="stitel"
                        value={titel}
                        onChange={(e) => setTitel(e.target.value)}
                        placeholder="z. B. Onboarding-Abbrüche reduzieren"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Kannst du später ändern.
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
                      <Users className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Du bist automatisch <strong>Moderator</strong> dieses Vorhabens. Der Account
                        liegt bei dir, alle eingeladenen Personen arbeiten auf deinem Vorhaben.
                      </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" asChild>
                        <Link to="/sprint">Abbrechen</Link>
                      </Button>
                      <Button type="submit" disabled={busy}>
                        {busy ? "Wird gestartet …" : "Design Sprint starten"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-2">
                Neuen{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">Sprint</span> starten
              </h1>
              <p className="text-muted-foreground mb-8">
                Als <strong>Moderator</strong> startest du das Problem Framing. Erste Seite ist immer die
                Team-Konstellation — du lädst dein Team per E-Mail ein. Anschließend führt euch das
                Framing in 10 Schritten (ca. 3–4 Stunden) zum Challenge Statement. Der Design Sprint
                entsteht erst mit Abschluss des Framings.
              </p>

              <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={startFraming} className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-semibold">Problem Framing starten</h2>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ftitel">Arbeitstitel für den Workshop</Label>
                      <Input
                        id="ftitel"
                        value={titel}
                        onChange={(e) => setTitel(e.target.value)}
                        placeholder="z. B. Warum springen Nutzer im Onboarding ab?"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Kannst du später ändern. Am Ende wird daraus dein Sprint-Titel.
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground flex gap-2">
                      <Users className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Du bist automatisch <strong>Moderator</strong> dieses Vorhabens. Der Account
                        liegt bei dir, alle eingeladenen Personen arbeiten auf deinem Vorhaben.
                      </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="ghost" asChild>
                        <Link to="/sprint">Abbrechen</Link>
                      </Button>
                      <Button type="submit" disabled={busy}>
                        {busy ? "Wird gestartet …" : "Problem Framing starten"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
