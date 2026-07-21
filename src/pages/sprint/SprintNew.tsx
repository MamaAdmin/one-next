import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateFramingSession } from "@/hooks/useFraming";
import { useCreateSprint } from "@/hooks/useSprint";
import { supabase } from "@/integrations/supabase/client";

export default function SprintNew() {
  const navigate = useNavigate();
  const createFraming = useCreateFramingSession();
  const createSprint = useCreateSprint();
  const [framingTitel, setFramingTitel] = useState("");
  const [busy, setBusy] = useState(false);

  async function startFlow(e: React.FormEvent) {
    e.preventDefault();
    const titel = framingTitel.trim();
    if (titel.length < 3) {
      toast({
        title: "Arbeitstitel zu kurz",
        description: "Mindestens 3 Zeichen.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const framing = await createFraming.mutateAsync({ titel_arbeitstitel: titel });

      // Sprint wird als „Team-Container" sofort vorangelegt, damit die Team-
      // Konstellation (Rollen, Einladungen) über sprint_members verwaltet werden
      // kann. Der Sprint bleibt für den Nutzer ausgeblendet, bis das Framing
      // abgeschlossen ist — dann wird er im Dashboard sichtbar.
      const sprint = await createSprint.mutateAsync({
        titel,
        problemstellung: "",
        modus: "team",
        decider: "",
        sprint_leader: "",
      });
      await supabase
        .from("framing_sessions")
        .update({ resulting_sprint_id: sprint.id })
        .eq("id", framing.id);

      toast({
        title: "Problem Framing gestartet",
        description: "Starte mit der Team-Konstellation.",
      });
      navigate(`/sprint/framing/${framing.id}?view=team`);
    } catch (e) {
      toast({
        title: "Konnte nicht gestartet werden",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 w-full px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
            ← Zur Sprint-Übersicht
          </Link>

          <h1 className="text-4xl font-bold mt-4 mb-2">
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
              <form onSubmit={startFlow} className="space-y-6">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Problem Framing starten</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ftitel">Arbeitstitel für den Workshop</Label>
                  <Input
                    id="ftitel"
                    value={framingTitel}
                    onChange={(e) => setFramingTitel(e.target.value)}
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
                  <Button
                    type="submit"
                    className="bg-gradient-primary hover:opacity-90"
                    disabled={busy}
                  >
                    {busy ? "Wird gestartet …" : "Problem Framing starten"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
