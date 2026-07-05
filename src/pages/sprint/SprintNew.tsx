import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Compass } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCreateFramingSession } from "@/hooks/useFraming";

export default function SprintNew() {
  const navigate = useNavigate();
  const createFraming = useCreateFramingSession();
  const [framingTitel, setFramingTitel] = useState("");

  async function startFraming(e: React.FormEvent) {
    e.preventDefault();
    if (framingTitel.trim().length < 3) {
      toast({
        title: "Arbeitstitel zu kurz",
        description: "Mindestens 3 Zeichen.",
        variant: "destructive",
      });
      return;
    }
    try {
      const s = await createFraming.mutateAsync({ titel_arbeitstitel: framingTitel.trim() });
      toast({ title: "Problem-Framing gestartet", description: "10 Schritte · ~3–4 Stunden." });
      navigate(`/sprint/framing/${s.id}`);
    } catch (e) {
      toast({
        title: "Konnte nicht gestartet werden",
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
          <span className="bg-gradient-primary bg-clip-text text-transparent">Sprint</span> starten
        </h1>
        <p className="text-muted-foreground mb-8">
          Jeder Sprint beginnt mit einem kurzen Problem Framing – 10 Schritte, ca. 3–4 Stunden.
          Am Ende entsteht automatisch dein Sprint mit geschärfter Sprint-Frage.
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
                  value={framingTitel}
                  onChange={(e) => setFramingTitel(e.target.value)}
                  placeholder="z. B. Warum springen Nutzer im Onboarding ab?"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Kannst du später ändern. Am Ende wird daraus dein Sprint-Titel.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" asChild>
                  <Link to="/sprint">Abbrechen</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={createFraming.isPending}
                >
                  {createFraming.isPending ? "Wird gestartet …" : "Problem Framing starten"}
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
