import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSprint, useConfirmSprintKickoff } from "@/hooks/useSprint";
import { useSprintMembers } from "@/hooks/useSprintTeam";
import SprintHandoverCard from "@/components/sprint/SprintHandoverCard";
import { TeamRoleGrid } from "@/components/sprint/TeamRoleGrid";
import SprintBasicsEditDialog from "@/components/sprint/SprintBasicsEditDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function SprintKickoff() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sprintQ = useSprint(id);
  const membersQ = useSprintMembers(id);
  const confirmKickoff = useConfirmSprintKickoff(id ?? "");
  const [editOpen, setEditOpen] = useState(false);

  const sprint = sprintQ.data;
  const members = membersQ.data ?? [];

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

  if (!sprint || !id) {
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

  const hasModerator = members.some((m) => m.rolle === "moderator");
  const handoverConfirmed = sprint.challenge_statement.trim().length > 0 && sprint.decider.trim().length > 0;
  const canStart = hasModerator && handoverConfirmed;

  const blockedReason = !handoverConfirmed
    ? "Bestätige zuerst den Handover aus dem Problem Framing."
    : !hasModerator
      ? "Moderator fehlt – bitte Seite neu laden."
      : null;

  async function handleStart() {
    if (!canStart) return;
    try {
      await confirmKickoff.mutateAsync();
      toast({ title: "Sprint startet", description: "Auf zu Schritt 1.1 – Map." });
      navigate(`/sprint/${id}`);
    } catch (e) {
      toast({
        title: "Sprint konnte nicht gestartet werden",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Navigation />

      <main className="flex-1 container mx-auto px-6 py-10 lg:py-16 max-w-5xl">
        <Link to="/sprint" className="text-sm text-muted-foreground hover:underline">
          ← Sprint-Übersicht
        </Link>

        <div className="mt-3 mb-8">
          <Badge variant="secondary" className="mb-2">
            <Flag className="w-3 h-3 mr-1" /> Sprint-Kickoff
          </Badge>
          <h1 className="text-3xl font-bold">Sprint-Kickoff: Outcome & Team</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Du bist der Moderator dieses Sprints. Prüfe das Ergebnis aus dem Problem Framing, lade
            dein Team ein und starte den Sprint, sobald der Handover bestätigt ist.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold">Outcome aus dem Problem Framing</h2>
            </div>
            <SprintHandoverCard sprint={sprint} onEdit={() => setEditOpen(true)} />
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-lg font-semibold">Team-Konstellation</h2>
            </div>
            <TeamRoleGrid sprintId={id} emphasizeDeciderMissing />
          </section>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground max-w-md">
                {blockedReason ? (
                  <span className="text-destructive">{blockedReason}</span>
                ) : (
                  <span>Alles bereit. Der Sprint kann jetzt starten.</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/sprint">Später</Link>
                </Button>
                <Button
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={!canStart || confirmKickoff.isPending}
                  onClick={handleStart}
                >
                  {confirmKickoff.isPending ? "Wird gestartet …" : "Sprint starten"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SprintBasicsEditDialog sprint={sprint} open={editOpen} onOpenChange={setEditOpen} />
      <Footer />
    </div>
  );
}
