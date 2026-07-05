import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Compass, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateFramingSession } from "@/hooks/useFraming";
import { useCreateSprint } from "@/hooks/useSprint";
import { supabase } from "@/integrations/supabase/client";

type TeamAnswer = "yes" | "no";

export default function SprintNew() {
  const navigate = useNavigate();
  const createFraming = useCreateFramingSession();
  const createSprint = useCreateSprint();
  const [framingTitel, setFramingTitel] = useState("");
  const [teamAnswer, setTeamAnswer] = useState<TeamAnswer>("no");
  const [busy, setBusy] = useState(false);

  const updateFramingRef = useUpdateFramingSession("");

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

      if (teamAnswer === "yes") {
        // Pre-create sprint so team can be assigned before framing.
        const sprint = await createSprint.mutateAsync({
          titel,
          problemstellung: "",
          modus: "team",
          decider: "",
          sprint_leader: "",
        });
        // Link framing → sprint so completion updates instead of duplicating.
        // Bypass typed hook to avoid dynamic hook-per-id.
        await (updateFramingRef.mutateAsync as unknown as (
          _: unknown,
        ) => Promise<unknown>).call(
          {
            mutateAsync: async () => {
              // no-op fallback
            },
          },
          {},
        );
        // Direct update because useUpdateFramingSession is bound to an id at hook time.
        const { supabase } = await import("@/integrations/supabase/client");
        await supabase
          .from("framing_sessions")
          .update({ resulting_sprint_id: sprint.id })
          .eq("id", framing.id);

        toast({
          title: "Sprint angelegt",
          description: "Stell dein Team zusammen, bevor das Framing startet.",
        });
        navigate(`/sprint/${sprint.id}/team`);
      } else {
        toast({
          title: "Problem Framing gestartet",
          description: "10 Schritte · ca. 3–4 Stunden.",
        });
        navigate(`/sprint/framing/${framing.id}`);
      }
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

      <main className="flex-1 container mx-auto px-6 py-16 max-w-2xl">
        <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
          ← Zur Sprint-Übersicht
        </Link>

        <h1 className="text-4xl font-bold mt-4 mb-2">
          Neuen{" "}
          <span className="bg-gradient-primary bg-clip-text text-transparent">Sprint</span> starten
        </h1>
        <p className="text-muted-foreground mb-8">
          Jeder Sprint beginnt mit einem Problem Framing – 10 Schritte, ca. 3–4 Stunden. Am Ende
          entsteht der Sprint mit geschärfter Sprint-Frage.
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

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <Label>Steht dein Team schon?</Label>
                </div>
                <RadioGroup
                  value={teamAnswer}
                  onValueChange={(v) => setTeamAnswer(v as TeamAnswer)}
                  className="space-y-2"
                >
                  <label
                    htmlFor="team-yes"
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40"
                  >
                    <RadioGroupItem value="yes" id="team-yes" className="mt-0.5" />
                    <div>
                      <div className="font-medium">Ja, das Team steht</div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Wir stellen zuerst die Rollen zusammen (Decider, Experten). Danach startet
                        das Problem Framing.
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="team-no"
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40"
                  >
                    <RadioGroupItem value="no" id="team-no" className="mt-0.5" />
                    <div>
                      <div className="font-medium">Noch nicht</div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Wir starten direkt mit dem Framing. Das Team stellst du danach beim
                        Kickoff zusammen.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
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
                  {busy
                    ? "Wird gestartet …"
                    : teamAnswer === "yes"
                      ? "Team zusammenstellen"
                      : "Problem Framing starten"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
