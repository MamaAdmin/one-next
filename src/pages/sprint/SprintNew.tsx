import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCreateSprint } from "@/hooks/useSprint";
import { z } from "zod";

const schema = z.object({
  titel: z.string().trim().min(3, "Bitte mindestens 3 Zeichen.").max(200),
  problemstellung: z.string().trim().min(10, "Bitte beschreibe das Problem etwas genauer.").max(2000),
  modus: z.enum(["solo", "team"]),
  decider: z.string().trim().max(120).default(""),
  sprint_leader: z.string().trim().max(120).default(""),
});

export default function SprintNew() {
  const navigate = useNavigate();
  const create = useCreateSprint();
  const [titel, setTitel] = useState("");
  const [problemstellung, setProblemstellung] = useState("");
  const [modus, setModus] = useState<"solo" | "team">("solo");
  const [decider, setDecider] = useState("");
  const [sprintLeader, setSprintLeader] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      titel,
      problemstellung,
      modus,
      decider,
      sprint_leader: sprintLeader,
    });
    if (!parsed.success) {
      toast({
        title: "Bitte Eingaben prüfen",
        description: parsed.error.errors[0]?.message ?? "Validierung fehlgeschlagen",
        variant: "destructive",
      });
      return;
    }
    try {
      const sprint = await create.mutateAsync(parsed.data);
      toast({ title: "Sprint angelegt", description: "Los geht's mit Tag 1 · Map." });
      navigate(`/sprint/${sprint.id}`);
    } catch (e: unknown) {
      toast({
        title: "Konnte Sprint nicht anlegen",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
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
          <span className="bg-gradient-primary bg-clip-text text-transparent">Sprint</span> anlegen
        </h1>
        <p className="text-muted-foreground mb-8">
          Diese Angaben kommen in jeden Schritt als Kontext.
        </p>

        <Card className="border-none shadow-xl">
          <CardContent className="p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titel">Sprint-Titel</Label>
                <Input
                  id="titel"
                  value={titel}
                  onChange={(e) => setTitel(e.target.value)}
                  placeholder="z. B. Onboarding neuer SaaS-Nutzer"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problemstellung</Label>
                <Textarea
                  id="problem"
                  value={problemstellung}
                  onChange={(e) => setProblemstellung(e.target.value)}
                  placeholder="Was ist das Problem oder die Chance, die ihr im Sprint anschaut?"
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modus">Modus</Label>
                <Select value={modus} onValueChange={(v) => setModus(v as "solo" | "team")}>
                  <SelectTrigger id="modus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">
                      Solo – die KI ersetzt das Team
                    </SelectItem>
                    <SelectItem value="team" disabled>
                      Team – folgt in Kürze
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Im Solo-Modus übernimmt die KI Teamabstimmungen und liefert Empfehlungen mit
                  Begründung.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decider">Decider</Label>
                  <Input
                    id="decider"
                    value={decider}
                    onChange={(e) => setDecider(e.target.value)}
                    placeholder="Wer entscheidet?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leader">Sprint Leader</Label>
                  <Input
                    id="leader"
                    value={sprintLeader}
                    onChange={(e) => setSprintLeader(e.target.value)}
                    placeholder="Moderation / Timer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" asChild>
                  <Link to="/sprint">Abbrechen</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={create.isPending}
                >
                  {create.isPending ? "Wird angelegt …" : "Sprint starten"}
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
